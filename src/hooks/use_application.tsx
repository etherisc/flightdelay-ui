import dayjs from "dayjs";
import { ethers, resolveAddress } from "ethers";
import { useEnvContext } from "next-runtime-env";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { resetErrors, setError, setRiskpoolHasCapacity } from "../redux/slices/flightData";
import { resetPurchase, setExecuting, setPolicy, setSigning } from "../redux/slices/purchase";
import { RootState } from "../redux/store";
import { Erc20PermitSignature } from "../types/erc20permitsignature";
import { ApplicationData, PermitData } from "../types/purchase_request";
import { PurchaseFailedError, PurchaseNotPossibleError } from "../utils/error";
import { useLocalApi } from "./api/use_local_api";
import { useERC20Contract } from "./onchain/use_erc20_contract";
import { useFlightDelayProductContract } from "./onchain/use_flightdelay_product";
import { useWallet } from "./onchain/use_wallet";
import { setGeneralErrorMessage } from "../redux/slices/common";
import { EVENT_API_ERROR, EVENT_BLACKLISTED_ARRIVAL_AIRPORT, EVENT_BLACKLISTED_DEPARTURE_AIRPORT, EVENT_INSUFFICIENT_BALANCE, EVENT_INVALID_CHAIN, EVENT_NON_WHITELISTED_AIRPORT, EVENT_PERMIT_SIGNED, EVENT_PURACHASE_SUCCESSFUL, EVENT_PURCHASE_FAILED_UNKNOWN_ERROR, EVENT_PURCHASE_NOT_POSSIBLE, EVENT_PURCHASE_STARTED, EVENT_RISKPOOL_FULL, EVENT_USER_REJECTED, useAnalytics } from "./use_analytics";

export default function useApplication() {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS, NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS, NEXT_PUBLIC_ERC20_TOKEN_VERSION, NEXT_PUBLIC_PREMIUM_TOKEN_DECIMALS } = useEnvContext();

    const { getSigner } = useWallet();
    const { hasBalance, getNonce, getName } = useERC20Contract(NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS!, parseInt(NEXT_PUBLIC_PREMIUM_TOKEN_DECIMALS || '6'));
    const { getProductTokenHandlerAddress } = useFlightDelayProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { sendPurchaseProtectionRequest, checkPurchaseCompleted, checkRiskpoolCapacity } = useLocalApi();
    const { trackEvent } = useAnalytics();
    const dispatch = useDispatch();
    
    const isExpectedChain = useSelector((state: RootState) => state.wallet.isExpectedChain);
    const departureAirport = useSelector((state: RootState) => state.flightData.departureAirport);
    const arrivalAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const isDepartureAirportWhiteListed = useSelector((state: RootState) => state.flightData.departureAirport?.whitelisted || false);
    const isArrivalAirportWhiteListed = useSelector((state: RootState) => state.flightData.arrivalAirport?.whitelisted || false);
    const isDepartureAirportBlackListed = useSelector((state: RootState) => state.flightData.departureAirport?.blacklisted || false);
    const isArrivalAirportBlackListed = useSelector((state: RootState) => state.flightData.arrivalAirport?.blacklisted || false);
    const premium = useSelector((state: RootState) => state.flightData.premium);
    const statistics = useSelector((state: RootState) => state.flightData.statistics);
    const departureDateUTC = useSelector((state: RootState) => state.flightData.departureTimeUTC);
    const departureTimeLocal = useSelector((state: RootState) => state.flightData.departureTime);
    const arrivalDateUTC = useSelector((state: RootState) => state.flightData.arrivalTimeUTC);
    const arrivalTimeLocal = useSelector((state: RootState) => state.flightData.arrivalTime);
    const carrier = useSelector((state: RootState) => state.flightData.carrier);
    const flightNumber = useSelector((state: RootState) => state.flightData.flightNumber);
    const errorReasonApi = useSelector((state: RootState) => state.flightData.errorReasonApi);
    const riskpoolHasCapacity = useSelector((state: RootState) => state.flightData.riskpoolHasCapacity);

    async function fetchRiskpoolCapacity() {
        // do nothing, just log for now
        console.log("checking riskpool capacity");
        const res = await checkRiskpoolCapacity();
        dispatch(setRiskpoolHasCapacity(res));
        if (! res) {
            dispatch(setGeneralErrorMessage(t("error.riskpool_full")));
        }
    }
    
    async function purchaseProtection() {
        console.log("purchaseProtection");
        dispatch(resetErrors());
        dispatch(resetPurchase());
        // do nothing, just log for now

        const canPurchase = isExpectedChain 
            && riskpoolHasCapacity
            && errorReasonApi === null
            && departureAirport !== null 
            && ( isDepartureAirportWhiteListed || isArrivalAirportWhiteListed )
            && ! isDepartureAirportBlackListed && ! isArrivalAirportBlackListed
            && premium !== null;

        // 0. Check if purchase is possible (blacklisted airports, etc.)
        if (!canPurchase) {
            if (! isExpectedChain) {
                dispatch(setError({ message: t("error.switch_chain_first"), level: "error" }));
                trackEvent(EVENT_INVALID_CHAIN, { category: "purchase"});
            } else if (! riskpoolHasCapacity) {
                dispatch(setError({ message: t("error.riskpool_full"), level: "error" }));
                trackEvent(EVENT_RISKPOOL_FULL, { category: "purchase"});
            } else if (isDepartureAirportBlackListed) {
                dispatch(setError({ message: t("error.change_flight"), level: "warning" }));    
                trackEvent(EVENT_BLACKLISTED_DEPARTURE_AIRPORT, { category: "purchase", airport: departureAirport?.iata});
            } else if (isArrivalAirportBlackListed) {
                dispatch(setError({ message: t("error.change_flight"), level: "warning" }));    
                trackEvent(EVENT_BLACKLISTED_ARRIVAL_AIRPORT, { category: "purchase", airport: arrivalAirport?.iata});
            } else if (! isDepartureAirportWhiteListed || ! isArrivalAirportWhiteListed) {
                dispatch(setError({ message: t("error.change_flight"), level: "warning" }));    
                trackEvent(EVENT_NON_WHITELISTED_AIRPORT, { category: "purchase", departure: departureAirport?.iata, arrival: arrivalAirport?.iata});
            } else if (errorReasonApi !== null) {
                dispatch(setError({ message: t("error.change_flight"), level: "warning" }));    
                trackEvent(EVENT_API_ERROR, { category: "purchase"});
            } else {
                dispatch(setError({ message: t("error.purchase_protection_not_possible"), level: "error" }));
                trackEvent(EVENT_PURCHASE_NOT_POSSIBLE, { category: "purchase"});
            }
            return;
        }

        // 1. Check if user has enough balance
        if (! await hasBalance(BigInt(premium!), (await getSigner())!)) {
            dispatch(setError({ message: t("error.insufficient_balance"), level: "warning" }));
            trackEvent(EVENT_INSUFFICIENT_BALANCE, { category: "purchase"});
            return;
        }

        trackEvent(EVENT_PURCHASE_STARTED, { category: "purchase"});

        console.log("purchaseProtection");
        dispatch(setExecuting(true));
        dispatch(setSigning(true));

        try {
            // 2. Calculate erc20 permit signature 
            const signature = await calculateErc20PermitSignature(BigInt(premium!));
            dispatch(setSigning(false));
            trackEvent(EVENT_PERMIT_SIGNED, { category: "purchase"});
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
                departureDate: dayjs(departureTimeLocal).format('YYYYMMDD'),
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
            const { tx } = await sendPurchaseProtectionRequest(permit, application);
            console.log("purchase request tx created", tx);
            trackEvent(EVENT_PURACHASE_SUCCESSFUL, { category: "purchase"});

            let result = { policyNftId: "0", riskId: "" };

            do {
                result = await checkPurchaseCompleted(tx);
                if (result.policyNftId === "0") {
                    console.log("waiting for policy creation");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } while (result.policyNftId === "0");

            console.log("purchase result", result);

            dispatch(setPolicy({policyNftId: result.policyNftId, riskId: result.riskId}));
        } catch (err) {
            if (err instanceof PurchaseFailedError) {
                console.log("purchase failed", err);
                dispatch(setError({ message: `${t("error.purchase_failed")} (${err.decodedError?.reason || "unknown error"})`, level: "error" }));
            } else if (err instanceof PurchaseNotPossibleError) {
                dispatch(setError({ message: t("error.purchase_currently_not_possible"), level: "error" }));
            } else {
                // @ts-expect-error code is custom field for metamask error
                if (err.code !== undefined) {
                    // @ts-expect-error code is custom field for metamask error
                    if (err.code === "ACTION_REJECTED") {
                        dispatch(setError({ message: t("error.user_rejected"), level: "error" }));
                        trackEvent(EVENT_USER_REJECTED, { category: "purchase"});
                    }
                } else {
                    console.error("purchase failed", err);
                    dispatch(setError({ message: t("error.unknown_error"), level: "error" }));
                    trackEvent(EVENT_PURCHASE_FAILED_UNKNOWN_ERROR, { category: "purchase"});
                }
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
            version: NEXT_PUBLIC_ERC20_TOKEN_VERSION ?? "1",
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
            deadline,
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
        fetchRiskpoolCapacity,
    }
}
