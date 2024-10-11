'use client';
import { Signer, ethers } from "ethers";
import { useEnvContext } from "next-runtime-env";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSnackbarErrorMessage } from "../../redux/slices/common";
import { resetPolicies } from "../../redux/slices/policies";
import { resetAccount, setAccountSwitchListenerConnected, setAddress, setBalanceEth, setBalanceUsdc, setConnected, setConnecting, setExpectedChain } from "../../redux/slices/wallet";
import { RootState } from "../../redux/store";
import { stringifyBigInt } from "../../utils/bigint";
import { chainId } from "../../utils/chain";
import { getBalance } from "../../utils/ierc20";
import { EVENT_CONNECT_WALLET, EVENT_CONNECT_WALLET_NO_WALLET, EVENT_DISCONNECT_WALLET, useAnalytics } from "../use_analytics";

export function useWallet() {
    const dispatch = useDispatch();
    const { 
        NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS, 
        NEXT_PUBLIC_EXPECTED_CHAIN_ID,
        NEXT_PUBLIC_EXPECTED_CHAIN_NAME,
        NEXT_PUBLIC_EXPECTED_CHAIN_RPC_NODE,
        NEXT_PUBLIC_EXPECTED_CHAIN_BLOCK_EXPLORER_URL,
        NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_NAME,
        NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_SYMBOL,
        NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_DECIMALS,
    } = useEnvContext();
    const { isAccountSwitchListenerConnected } = useSelector((state: RootState) => (state.wallet));
    const { trackEvent } = useAnalytics();

    const canAddNetwork = NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined 
        && NEXT_PUBLIC_EXPECTED_CHAIN_NAME !== undefined 
        && NEXT_PUBLIC_EXPECTED_CHAIN_RPC_NODE !== undefined 
        && NEXT_PUBLIC_EXPECTED_CHAIN_BLOCK_EXPLORER_URL !== undefined 
        && NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_NAME !== undefined 
        && NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_SYMBOL !== undefined 
        && NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_DECIMALS !== undefined;

    /* function getSigner */
    const getSigner = useCallback(async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!window.ethereum) {
            dispatch(setSnackbarErrorMessage("Please install MetaMask first."));
            return undefined;
        }
        
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const provider = new ethers.BrowserProvider(window.ethereum);
        try {
            const signer = await provider.getSigner();
            return signer;
        } catch (error: unknown) {
            console.log(error);
            throw error;
        }
    }, [dispatch]);

    const getAddressAndBalance = useCallback(async (signer: Signer) => {
        const address = await signer.getAddress();
        // console.log("address", address);
        dispatch(setAddress(address));

        if (address !== undefined) {
            try {
                const balanceEth = await signer.provider?.getBalance(address) || BigInt(0);
                console.log("address, balance", address, balanceEth);
                dispatch(setBalanceEth(stringifyBigInt(balanceEth)));
                const erc20TokenContractAddress = NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS;
                // console.log("erc20TokenContractAddress", erc20TokenContractAddress);
                if (erc20TokenContractAddress !== undefined) {
                    console.log("erc20TokenContractAddress", erc20TokenContractAddress);
                    const bal = await getBalance(erc20TokenContractAddress, address, (await getSigner())!); // TODO: remove the ! when getSigner is fixed
                    console.log("erc20 address, balance", address, bal);
                    dispatch(setBalanceUsdc(stringifyBigInt(bal)));
                }
            } catch (err) {
                console.log("error fetching balance", err);
            }
        }
    }, [dispatch, NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS, getSigner]);

    const connectWallet = useCallback(async () => {
        trackEvent(EVENT_CONNECT_WALLET);
        dispatch(setConnecting(true));
        dispatch(resetAccount());
        dispatch(resetPolicies());
        try {
            const signer = await getSigner();
            if (signer === undefined) {
                trackEvent(EVENT_CONNECT_WALLET_NO_WALLET);
                return;
            }

            dispatch(setConnected(true));

            // get address and balance
            await getAddressAndBalance(signer);

            // check chain id is expected
            if (NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined && (await chainId(signer)) !== BigInt(parseInt(NEXT_PUBLIC_EXPECTED_CHAIN_ID))) {
                dispatch(setExpectedChain(false));
                return;
            } else {
                dispatch(setExpectedChain(true));
            }            
        } catch (error: unknown) {
            console.log(error);
        } finally {
            setConnecting(false);
        }
    }, [dispatch, getSigner, NEXT_PUBLIC_EXPECTED_CHAIN_ID, getAddressAndBalance, trackEvent]);

    async function disconnectWallet() {
        trackEvent(EVENT_DISCONNECT_WALLET);
        dispatch(resetAccount());
        dispatch(resetPolicies());
    }

    async function refreshBalance() {
        const signer = await getSigner();
        if (signer === undefined) {
            return;
        }
        await getAddressAndBalance(signer);
    }

    async function reconnectWallet() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!window.ethereum) {
            return;
        }

        console.log("reconnectWallet");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const provider = new ethers.BrowserProvider(window.ethereum);
        const hasAccounts = (await provider.send("eth_accounts", [])).length > 0;
        if (hasAccounts) {
            console.log("reconnectWallet");
            // do not await, as this will block the UI update and can be done in the background
            connectWallet();
            return true;
        }
        return false;
    }

    async function switchChain() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.ethereum !== undefined) {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: toHexString(parseInt(NEXT_PUBLIC_EXPECTED_CHAIN_ID ?? '1')) }],
                });
            } catch (switchError) {
                // @ts-expect-error code is not defined in the global scope
                if (switchError.code === 4902 && canAddNetwork) {
                    await addNetwork();
                }
            }
        }
    }

    async function addNetwork() {
        // @ts-expect-error ethereum is not defined in the global scope
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: toHexString(parseInt(NEXT_PUBLIC_EXPECTED_CHAIN_ID ?? '1')),
                    chainName: NEXT_PUBLIC_EXPECTED_CHAIN_NAME ?? 'Unknown',
                    rpcUrls: [NEXT_PUBLIC_EXPECTED_CHAIN_RPC_NODE],
                    nativeCurrency: {
                        name: NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_NAME ?? 'Unknown',
                        symbol: NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_SYMBOL ?? 'Unknown',
                        decimals: parseInt(NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_DECIMALS ?? '18'),
                    },
                    blockExplorerUrls: [NEXT_PUBLIC_EXPECTED_CHAIN_BLOCK_EXPLORER_URL]
                },
            ],
        });
    }

    function toHexString(x: number) {
        if (typeof x === 'string') {
            return x;
        }
        return '0x' + x.toString(16);
    }


    const accountChanged = useCallback(async (accounts: string[]) => {
        console.log("accountChanged", accounts);
        await connectWallet();
    }, [connectWallet]);

    const networkChanged = useCallback(async (networkId: string) => {
        console.log("networkChanged", networkId);
        await connectWallet();
    }, [connectWallet]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.ethereum !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.ethereum.on('networkChanged', networkChanged);
        }

        if (isAccountSwitchListenerConnected) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.ethereum !== undefined && ! isAccountSwitchListenerConnected) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.ethereum.on('accountsChanged', accountChanged);
        }
        // else case has no window.etherum, so we can't add the listener and therfor do as if it was connected
        dispatch(setAccountSwitchListenerConnected(true));
    }, [isAccountSwitchListenerConnected, dispatch, accountChanged, networkChanged]);

    return { 
        connectWallet, 
        disconnectWallet,
        getSigner, 
        reconnectWallet, 
        switchChain,
        refreshBalance,
    };
}
