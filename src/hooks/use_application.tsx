import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useTranslation } from "react-i18next";
import { useERC20Contract } from "./onchain/use_erc20_contract";
import { useEnvContext } from "next-runtime-env";
import { useWallet } from "./onchain/use_wallet";
import { ethers, resolveAddress } from "ethers";
import dayjs from "dayjs";
import { useFlightDelayProductContract } from "./onchain/use_flightdelay_product";
import { Erc20PermitSignature } from "../types/erc20permitsignature";
import { useLocalApi } from "./api/use_local_api";
import { ApplicationData, PermitData } from "../types/purchase_request";
import { resetPurchase, setExecuting, setPolicy } from "../redux/slices/purchase";
import { PurchaseFailedError, PurchaseNotPossibleError } from "../utils/error";

export default function useApplication() {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS, NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS, NEXT_PUBLIC_PREMIUM_TOKEN_DECIMALS } = useEnvContext();

    const { getSigner } = useWallet();
    const { hasBalance, getNonce, getName } = useERC20Contract(NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS!, parseInt(NEXT_PUBLIC_PREMIUM_TOKEN_DECIMALS || '6'));
    const { getProductTokenHandlerAddress } = useFlightDelayProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { sendPurchaseProtectionRequest } = useLocalApi();
    const dispatch = useDispatch();
    
    const [error, setError] = useState<string | null>(null);
    const departureAirport = useSelector((state: RootState) => state.flightData.departureAirport);
    const arrivalAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const isDepartureAirportWhiteListed = useSelector((state: RootState) => state.flightData.departureAirport?.whitelisted || false);
    const isArrivalAirportWhiteListed = useSelector((state: RootState) => state.flightData.arrivalAirport?.whitelisted || false);
    const premium = useSelector((state: RootState) => state.flightData.premium);
    const statistics = useSelector((state: RootState) => state.flightData.statistics);
    const departureDateUTC = useSelector((state: RootState) => state.flightData.departureTimeUTC);
    const departureTimeLocal = useSelector((state: RootState) => state.flightData.departureTime);
    const arrivalDateUTC = useSelector((state: RootState) => state.flightData.arrivalTimeUTC);
    const arrivalTimeLocal = useSelector((state: RootState) => state.flightData.arrivalTime);
    const carrier = useSelector((state: RootState) => state.flightData.carrier);
    const flightNumber = useSelector((state: RootState) => state.flightData.flightNumber);
    
    async function purchaseProtection() {
        setError(null);
        dispatch(resetPurchase());
        // do nothing, just log for now

        const canPurchase = departureAirport !== null && isDepartureAirportWhiteListed && isArrivalAirportWhiteListed && premium !== null;

        // 0. Check if purchase is possible (blacklisted airports, etc.)
        if (!canPurchase) {
            if (! isDepartureAirportWhiteListed || ! isArrivalAirportWhiteListed) {
                setError(t("error.change_flight"));    
            } else {
                setError(t("error.purchase_protection_not_possible"));
            }
            return;
        }

        // 1. Check if user has enough balance
        if (! await hasBalance(BigInt(premium!), (await getSigner())!)) {
            setError(t("error.insufficient_balance"));
            return;
        }

        console.log("purchaseProtection");
        dispatch(setExecuting(true));

        try {
            // 2. Calculate erc20 permit signature 
            const signature = await calculateErc20PermitSignature(BigInt(premium!));
            console.log("signature", signature);

            // 3. send all data relevant for tx to the backend
            const permit = {
                owner: signature.owner,
                spender: signature.spender,
                value: signature.value,
                deadline: signature.deadline,
                v: signature.v,
                r: signature.r,
                s: signature.s
            } as PermitData;
            const application = {
                carrier,
                flightNumber,
                departureAirport: departureAirport.iata,
                arrivalAirport: arrivalAirport!.iata,
                departureDate: dayjs.utc(departureDateUTC).format('YYYYMMDD'),
                departureTime: dayjs.utc(departureDateUTC).unix(),
                departureTimeLocal: `${departureTimeLocal} ${departureAirport.timeZoneRegionName}`,
                arrivalTime: dayjs.utc(arrivalDateUTC).unix(),
                arrivalTimeLocal: `${arrivalTimeLocal} ${arrivalAirport!.timeZoneRegionName}`,
                premiumAmount: BigInt(premium!),
                statistics: statistics!,
                v: signature.v,
                r: signature.r,
                s: signature.s
            } as ApplicationData;

            console.log("purchase request data", permit, application);
            const result = await sendPurchaseProtectionRequest(permit, application);
            console.log("purchase result", result);

            dispatch(setPolicy({policyNftId: result.policyNftId, riskId: result.riskId}));
        } catch (err) {
            if (err instanceof PurchaseFailedError) {
                console.log("purchase failed", err);
                setError(`${t('error.purchase_failed')} (${err.decodedError?.reason || "unknown error"})`);
            } else if (err instanceof PurchaseNotPossibleError) {
                setError(t("error.purchase_currently_not_possible"));
            } else {
                console.error("purchase failed", err);
                setError("unknown error");
            }
        } finally {
            dispatch(setExecuting(false));
        }
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
        ]};

        const owner = await resolveAddress(signer);
        const spender = await getProductTokenHandlerAddress(signer);
        console.log(deadline);
        // set the Permit type values
        const values = {
            owner,
            spender,
            value: amount,
            nonce,
            deadline: deadline * 1000,
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

    function resetPurchaseProtectionError() {
        setError(null);
    }

    return {
        purchaseProtection,
        resetPurchaseProtectionError,
        purchaseProtectionError: error,
    }
}
