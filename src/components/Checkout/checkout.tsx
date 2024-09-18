import { Box, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BackButton from "../(basic_widgets)/BackButton/back_button";
import Date from "../(basic_widgets)/Date/date";
import { ProgressModal } from "../(basic_widgets)/ProgressModal/progress_modal";
import { SIGNUP_STEP_COVERAGE_TYPE } from "../../utils/step_constants";
import { BLUE_LIGHT } from "../../config/theme";
import { useCheckout } from "../../hooks/use_checkout";
import { setStep } from "../../redux/slices/signup";
import { RootState } from "../../redux/store";
import { parseBigInt } from "../../utils/bigint";
import WalletConnected from "./wallet_connected";
import WalletNotConnected from "./wallet_not_connected";
import { useAnalytics } from "../../hooks/use_analytics";
import Trans from "../Trans/trans";
import NameValueBox from "../NameValueBox/name_value_box";
// import { DevTool } from "@hookform/devtools";


export default function Checkout() {
    const dispatch = useDispatch();
    const { createNewApplication, calculateReferralCodeDiscount, trxInProgress, error } = useCheckout();
    const { trackPageView } = useAnalytics();

    function back() {
        dispatch(setStep(SIGNUP_STEP_COVERAGE_TYPE));
    }

    const address = useSelector((state: RootState) => (state.wallet.address));
    const balance = parseBigInt(useSelector((state: RootState) => (state.wallet.balanceUsdc)));

    const locationId = useSelector((state: RootState) => (state.application.locationId));
    const locationName = useSelector((state: RootState) => (state.application.locationName));
    const locationCoordinates = useSelector((state: RootState) => (state.application.locationCoordinates));
    const endDate = useSelector((state: RootState) => (state.application.endDate));
    const symbol = useSelector((state: RootState) => (state.common.tokenSymbol));
    const sumInsured = useSelector((state: RootState) => (state.application.sumInsured));
    const coverageType = useSelector((state: RootState) => (state.application.type));
    const premium = useSelector((state: RootState) => (state.application.premium));
    const finalPremium = useSelector((state: RootState) => (state.application.finalPremium));
    const referralCode = useSelector((state: RootState) => (state.application.referralCode));
    const referralCodeDiscount = useSelector((state: RootState) => (state.application.referralDiscount));
    const preloadedReferralCode = useSelector((state: RootState) => (state.signup.referralCode));
    const triggerMmi = useSelector((state: RootState) => (state.application.triggerMmi));

    const applyReferralCode = useCallback(async (referralCode: string) => {
        await calculateReferralCodeDiscount(referralCode, premium);
    }, [calculateReferralCodeDiscount, premium]);

    async function buy() {
        await createNewApplication(premium, finalPremium, sumInsured, locationId, locationCoordinates, referralCode, triggerMmi, coverageType);
    }

    // do this once on component mount
    useEffect(() => {
        trackPageView("signup - checkout", "/signup/checkout");

        if (referralCode !== null) {
            applyReferralCode(referralCode);
        } else if (preloadedReferralCode !== null && referralCode === null) {
            applyReferralCode(preloadedReferralCode);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const referralCodeToUse = referralCode !== null 
                                ? referralCode 
                                : preloadedReferralCode !== null 
                                    ? preloadedReferralCode 
                                    : referralCode;

    let paymentBlock = <></>;

    if (address == null) {
        paymentBlock = <WalletNotConnected symbol={symbol} premium={premium} />
    } else {
        paymentBlock = <WalletConnected 
                            symbol={symbol} 
                            premium={premium} 
                            finalPremium={finalPremium}
                            referralCode={referralCodeToUse}
                            referralCodeDiscount={referralCodeDiscount}
                            address={address} 
                            balance={balance} 
                            onApplyReferralCode={applyReferralCode}
                            onBuy={buy} 
                            error={error}
                            />
    }
    
    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', alignItems: 'baseline'}}>
                <BackButton onClick={back} />
                <Typography color="primary" variant="h2" sx={{ ml: 2 }}>
                    <Trans k="checkout.title" />
                </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.25 }} data-testid="offer-values">
                <NameValueBox name={<Trans k="location" />} value={locationName} bgColor={BLUE_LIGHT} roundedCornersTop={true} />
                <NameValueBox name={<Trans k="policy_end_date" />} value={<Date timestamp={endDate} />} bgColor={BLUE_LIGHT} />
                <NameValueBox name={<Trans k="coverage_amount" />} value={`${symbol} ${sumInsured}`} bgColor={BLUE_LIGHT} />
                <NameValueBox name={<Trans k="protection_type" />} value={<Trans k={`protection_type_names.${coverageType}`} />} bgColor={BLUE_LIGHT} roundedCornersBottom={true} />
            </Box>

            {paymentBlock}

            {trxInProgress && 
                <ProgressModal>
                    <Typography variant="h3" textAlign="center" sx={{ pb: 1 }}><Trans k="checkout.trx_in_progress1"/></Typography>
                    <Typography variant="h3" textAlign="center"><Trans k="checkout.trx_in_progress2"/></Typography>
                </ProgressModal>
            }
        </Box>
    );
}
