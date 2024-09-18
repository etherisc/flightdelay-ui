'use client';

import { Trans } from "component-lib";
import { useEnvContext } from "next-runtime-env";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Features } from "../../types/features";
import Checkout from "../../components/Checkout/checkout";
import EnterPremiumAmount from "../../components/EnterPremiumAmount/enter_premium_amount";
import InvalidChain from "../../components/InvalidChain/invalid_chain";
import SelectCoverageType from "../../components/SelectCoverageType/select_coverage_type";
import { setPreloadedReferralCode } from "../../redux/slices/signup";
import { RootState } from "../../redux/store";
import { SIGNUP_STEP_CHECKOUT, SIGNUP_STEP_CONFIRM_LOCATION, SIGNUP_STEP_COVERAGE_TYPE, SIGNUP_STEP_PREMIUM_AMOUNT, SIGNUP_STEP_SELECT_LOCATION } from "../../utils/step_constants";
import { useAnalytics } from "../../hooks/use_analytics";

// map is not server side rendered
const SelectLocationOnMap = dynamic(() => import('../../components/SelectLocationOnMap/select_location_on_map'), {
    ssr: false,
});


export function Content({ clientLatitude, clientLongitude, referralCode, features } : { clientLatitude: number | null, clientLongitude: number | null, referralCode?: string, features?: Features }) {
    const dispatch = useDispatch();
    const { trackPageView } = useAnalytics();
    const step = useSelector((state: RootState) => (state.signup.step));
    const isExpectedChain = useSelector((state: RootState) => (state.wallet.isExpectedChain));
    const { NEXT_PUBLIC_EXPECTED_CHAIN_ID, NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();
    
    useEffect(() => {
        if (referralCode !== undefined) {
            trackPageView("signup - referral code", "/signup/[referralCode]");
            dispatch(setPreloadedReferralCode(referralCode));
        } else {
            trackPageView("signup", "/signup");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (! isExpectedChain) {
        if (NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined && NEXT_PUBLIC_EXPECTED_CHAIN_NAME !== undefined) {
            return (<InvalidChain />);
        }
    }

    switch(step) {
        case SIGNUP_STEP_SELECT_LOCATION:
        case SIGNUP_STEP_CONFIRM_LOCATION:
            return (<SelectLocationOnMap clientLatitude={clientLatitude} clientLongitude={clientLongitude} locationSearchEnabled={features?.locationSearch ?? false}/>);
        case SIGNUP_STEP_PREMIUM_AMOUNT:
            return (<EnterPremiumAmount />);
        case SIGNUP_STEP_COVERAGE_TYPE:
            return (<SelectCoverageType />);
        case SIGNUP_STEP_CHECKOUT:
            return (<Checkout />);
        default:
            return (<Trans k="unknown_step" />);
    }
}