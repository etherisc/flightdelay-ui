import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useTranslation } from "react-i18next";
import { useERC20Contract } from "./onchain/use_erc20_contract";
import { PREMIUM_TOKEN_DECIMALS } from "../config/constants";
import { useEnvContext } from "next-runtime-env";
import { useWallet } from "./onchain/use_wallet";
import { ethers, resolveAddress } from "ethers";
import dayjs from "dayjs";
import { useFlightDelayProductContract } from "./onchain/use_flightdelay_product";
import { Erc20PermitSignature } from "../types/erc20permitsignature";

export default function useApplication() {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS, NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS } = useEnvContext();

    const { hasBalance, getNonce, getName } = useERC20Contract(NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS!, PREMIUM_TOKEN_DECIMALS);
    const { getProductTokenHandlerAddress } = useFlightDelayProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getSigner } = useWallet();
    
    const [error, setError] = useState<string | null>(null);
    const departureAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const isDepartureAirportWhiteListed = useSelector((state: RootState) => state.flightData.departureAirport?.whitelisted || true);
    const isArrivalAirportWhiteListed = useSelector((state: RootState) => state.flightData.arrivalAirport?.whitelisted || true);
    const premium = useSelector((state: RootState) => state.flightData.premium);
    
    async function purchaseProtection() {
        setError(null);
        // do nothing, just log for now

        const canPurchase = departureAirport !== null && isDepartureAirportWhiteListed && isArrivalAirportWhiteListed && premium !== null;

        // 0. Check if purchase is possible (blacklisted airports, etc.)
        if (!canPurchase) {
            setError(t("error.purchase_protection_not_possible"));
            return;
        }

        // 1. Check if user has enough balance
        if (! await hasBalance(BigInt(premium!), (await getSigner())!)) {
            setError(t("error.insufficient_balance"));
            return;
        }

        console.log("purchaseProtection");

        // 2. Calculate erc20 permit signature 
        const signature = await calculateErc20PermitSignature(BigInt(premium!));
        console.log("signature", signature);

        // TODO: 3. send all data relevant for tx to the backend
    }

    async function calculateErc20PermitSignature(amount: bigint): Promise<Erc20PermitSignature> {
        // set token value and deadline
        const deadline = dayjs().add(1, 'd').unix();
        const signer = await getSigner();
        if (!signer) {
            throw Error('signer not set');
        }
    
        const chainId = (await signer.provider.getNetwork()).chainId;
        const name = await getName(signer);
        // get the current nonce for the deployer address
        const nonce = await getNonce(signer);
    
        // set the domain parameters
        const domain = {
            name,
            version: "1",
            chainId,
            verifyingContract: NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS
        };
    
        // set the Permit type parameters
        const types = {
        Permit: [{
            name: "owner",
            type: "address"
            },
            {
            name: "spender",
            type: "address"
            },
            {
            name: "value",
            type: "uint256"
            },
            {
            name: "nonce",
            type: "uint256"
            },
            {
            name: "deadline",
            type: "uint256"
            },
        ],
        };

        const owner = await resolveAddress(signer);
        const spender = await getProductTokenHandlerAddress(signer);
    
        // set the Permit type values
        const values = {
            owner,
            spender,
            value: amount,
            nonce: nonce,
            deadline: deadline,
        };
    
        // sign the Permit type data with the deployer's private key
        const signature = await signer.signTypedData(domain, types, values);
    
        // split the signature into its components
        const splitSignature = ethers.Signature.from(signature);

        return {
            owner: values.owner,
            spender: values.spender,
            value: values.value,
            nonce: values.nonce,
            deadline: values.deadline,
            v: splitSignature.v,
            r: splitSignature.r,
            s: splitSignature.s
        }
    }

    return {
        purchaseProtection,
        purchaseProtectionError: error,
    }
}
