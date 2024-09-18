"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationData, resetApplication } from "../../../redux/slices/application";
import { setStep } from "../../../redux/slices/signup";
import { SIGNUP_STEP_SELECT_LOCATION } from "../../../utils/step_constants";
import { CheckoutSuccess } from "../../../components/CheckoutSuccess/checkout_success";
import { RootState } from "../../../redux/store";
import { useAnalytics } from "../../../hooks/use_analytics";

export default function CheckoutSuccessPage() {
    const dispatch = useDispatch();
    const { trackPageView } = useAnalytics();
    const stateApplData = useSelector((state: RootState) => (state.application));
    const [ applicationData, setApplicationData ] = useState<ApplicationData>(stateApplData);
    const symbol = useSelector((state: RootState) => (state.common.tokenSymbol));

    useEffect(() => {
        dispatch(resetApplication());
        dispatch(setStep(SIGNUP_STEP_SELECT_LOCATION));
    }, [dispatch]);

    // this allows pushing a new redux state for debugging
    useEffect(() => {
        if (stateApplData.nftId !== null && stateApplData.nftId !== "") {
            setApplicationData(stateApplData);
        }
    }, [stateApplData]);

    useEffect(() => {
        trackPageView("signup - checkout success", "/signup/success");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return <CheckoutSuccess applicationData={applicationData} symbol={symbol} />;
}
