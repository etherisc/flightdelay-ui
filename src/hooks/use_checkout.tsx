import { ContractTransactionResponse } from "ethers";
import { useEnvContext } from "next-runtime-env";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Coordinates } from "../types/coordinates";
import { CoverageType } from "../types/coverage_type";
import { stringifyBigInt } from "../utils/bigint";
import { BaseError, ensureError } from "../utils/error";
import { logErrorOnBackend } from "../utils/logger";
import { setNftId, setReferralCode } from "../redux/slices/application";
import { RootState } from "../redux/store";
import { useQApiApplication } from "./api/use_qapi_application";
import { useDistributionContract } from "./onchain/use_distribution_contract";
import { useERC20Contract } from "./onchain/use_erc20_contract";
import { useProductContract } from "./onchain/use_product_contract";
import { useWallet } from "./onchain/use_wallet";
import { PATH_SIGNUP_SUCCESS } from "../utils/paths";
import { EVENT_BEGIN_CHECKOUT, EVENT_CHECKOUT_DISCOUNT_CODE_APPLIED, EVENT_CHECKOUT_DISCOUNT_CODE_INVALID, EVENT_CHECKOUT_INSUFFICIENT_BALANCE, EVENT_PURCHASE, useAnalytics } from "./use_analytics";

export function useCheckout() {
    const [ trxInProgress, setTrxInProgress ] = useState(false);
    const [ error, setError ] = useState<Error | undefined>(undefined);

    const { getSigner } = useWallet();
    const dispatch = useDispatch();
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const tokenDecimals = useSelector((state: RootState) => (state.common.tokenDecimals));
    const { NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS, NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS } = useEnvContext();
    const { createApplication, getTokenHandlerAddress } = useProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS);
    const { calculateDiscountPercentage } = useDistributionContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS);
    const { createApproval, convertAmountToWei, hasBalance } = useERC20Contract(NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS, tokenDecimals);
    const { submitTransaction } = useQApiApplication();

    async function createNewApplication(premium:number, finalPremium: number, sumInsured: number, locationId: number, locationCoordinates: Coordinates, referralCode: string, triggerMmi: number, coverageType: CoverageType): Promise<void> {
        setTrxInProgress(true);
        setError(undefined);
        try {
            trackEvent(EVENT_BEGIN_CHECKOUT);
            const signer = await getSigner();

            const premiumInWei = await convertAmountToWei(premium);
            const finalPremiumInWei = await convertAmountToWei(finalPremium);
            console.log("premiumInWei", premiumInWei, "finalPremiumInWei", finalPremiumInWei);
            
            const balanceAvailable = await hasBalance(premiumInWei, signer);
            console.log("balanceAvailable", balanceAvailable);
            if (!balanceAvailable) {
                trackEvent(EVENT_CHECKOUT_INSUFFICIENT_BALANCE);
                setError(new BaseError("CHE-001:INSUFFICIENT_BALANCE"));
                return;
            }

            const sumInsuredInWei = await convertAmountToWei(sumInsured);
            console.log("sumInsuredInWei", sumInsuredInWei);
            let trx = undefined;
            
            const tokenHandlerAddress = await getTokenHandlerAddress(signer);
            await createApproval(finalPremiumInWei, tokenHandlerAddress, signer);
            // createApplication will calculate the final premium again, so we need to pass the initial premium in wei AND the referral code
            const { nftId } = await createApplication(
                await getSigner(),
                locationId,
                locationCoordinates,
                referralCode || "",
                triggerMmi,
                coverageType,
                sumInsuredInWei,
                premiumInWei,
                async (tx: ContractTransactionResponse) => {
                    trx = tx;
                    await submitTxHash(trx.hash);
                }
            );
            trackEvent(EVENT_PURCHASE);

            await submitTxHash(trx.hash, nftId);
            
            console.log("nftId", nftId);
            dispatch(setNftId(stringifyBigInt(nftId)));
            router.push(PATH_SIGNUP_SUCCESS);
        } catch (err) {
            const error = ensureError(err);
            logErrorOnBackend(error.message, error, "createNewApplication");
            setError(error);
        } finally {
            setTrxInProgress(false);
        }
    }

    async function submitTxHash(hash: string, nftId?: bigint) {
        try {
            await submitTransaction(hash, nftId);
        } catch(err) {
            const error = ensureError(err);
            logErrorOnBackend(error.message, error, "createNewApplication");
            // do not throw further here, we want to continue with the transaction
        }
    }

    async function calculateReferralCodeDiscount(referralCode: string, premium: number) {
        setError(undefined);
        try {
            if (referralCode.trim() === "") {
                dispatch(setReferralCode({ code: null, referralDiscount: 0, finalPremium: premium }));
                return;
            }
            const signer = await getSigner();
            
            const { discountPercentage, referralStatus } = await calculateDiscountPercentage(signer, referralCode);
            console.log("calculateReferralCodeDiscount", discountPercentage, referralStatus);
            if (referralStatus !== 10) {
                trackEvent(EVENT_CHECKOUT_DISCOUNT_CODE_INVALID);
                dispatch(setReferralCode({ code: referralCode, referralDiscount: 0, finalPremium: premium }));    
                throw new BaseError("CHE-030:REFERRAL_CODE_INVALID", "referralStatus: " + referralStatus, { context: referralStatus });
            } else {
                trackEvent(EVENT_CHECKOUT_DISCOUNT_CODE_APPLIED);
                const discountedPremium = (premium * (1 - discountPercentage));
                dispatch(setReferralCode({ code: referralCode, referralDiscount: discountPercentage, finalPremium: discountedPremium }));    
            }
        } catch (err) {
            const error = ensureError(err);
            logErrorOnBackend(error.message, error, "calculateReferralCodeDiscount");
            setError(error);
        } 
    }

    return {
        createNewApplication,
        calculateReferralCodeDiscount,
        trxInProgress,
        error,
    }
}