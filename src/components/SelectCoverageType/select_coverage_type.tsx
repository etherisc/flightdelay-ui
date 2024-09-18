import { Alert, Box, RadioGroup, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useEffect, useMemo, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import BackButton from "../(basic_widgets)/BackButton/back_button";
import Card from "../(basic_widgets)/Card/card";
import Date from "../(basic_widgets)/Date/date";
import { BLUE_LIGHT } from "../../config/theme";
import { CoverageType } from "../../types/coverage_type";
import { setType } from "../../redux/slices/application";
import { setStep } from "../../redux/slices/signup";
import { RootState } from "../../redux/store";
import { SIGNUP_STEP_CHECKOUT, SIGNUP_STEP_PREMIUM_AMOUNT } from "../../utils/step_constants";
import CoverageTypeBox from "./coverage_type_box";
import { EVENT_SIGNUP_NO_TYPE_SELECTED, useAnalytics } from "../../hooks/use_analytics";
// import { DevTool } from "@hookform/devtools";

export interface ICoverageTypeFormValues {
    type: CoverageType | null;
}

export default function SelectCoverageType() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { trackPageView, trackEvent } = useAnalytics();

    const locationName = useSelector((state: RootState) => (state.application.locationName));
    const endDate = useSelector((state: RootState) => (state.application.endDate));
    const symbol = useSelector((state: RootState) => (state.common.tokenSymbol));
    const premium = useSelector((state: RootState) => (state.application.premium));
    const coverageTypes = useSelector((state: RootState) => (state.signup.availableTypes));
    const alertRef = useRef(null);
    const isBrowser = window !== undefined;

    const { handleSubmit, control, formState, setValue, watch } = useForm<ICoverageTypeFormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
        defaultValues: {
            type: null,
        }
    });

    const typeWatched = watch('type');

    function back() {
        dispatch(setStep(SIGNUP_STEP_PREMIUM_AMOUNT));
    }

    function cardSelected(type: CoverageType) {
        setValue('type', type);
    }

    const onSubmit: SubmitHandler<ICoverageTypeFormValues> = data => {
        const type = data.type;
        const sumInsured = coverageTypes.find((type) => type.type === data.type)?.sumInsured;
        const triggerMmi = coverageTypes.find((type) => type.type === data.type)?.payoutScheme[0].mmiLevel;
        dispatch(setType({ type, sumInsured, triggerMmi }));
        dispatch(setStep(SIGNUP_STEP_CHECKOUT));
    };

    useEffect(() => {
        trackPageView("signup - select coverage type", "/signup/select_coverage_type");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const errors = useMemo(() => formState.errors, [formState]);

    useEffect(() => {
        // the last check is necessary because the alertRef.current?.scrollIntoView is not available on the server and during tests
        if (isBrowser && errors.type !== undefined && alertRef.current !== null && alertRef.current?.scrollIntoView !== undefined) {
            alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (errors.type !== undefined) {
            trackEvent(EVENT_SIGNUP_NO_TYPE_SELECTED);
        }
    }, [errors.type, isBrowser, trackEvent]);

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', mb: 2 }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline'}}>
                    <BackButton onClick={back} />
                    <Typography color={theme.palette.primary.main} variant="h2" sx={{ ml: 2 }}>
                        <Trans k="coverage_type.title" />
                    </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.25 }} data-testid="offer-values">
                    <NameValueBox name={<Trans k="location" />} value={locationName} bgColor={BLUE_LIGHT} roundedCornersTop={true} />
                    <NameValueBox name={<Trans k="policy_end_date" />} value={<Date timestamp={endDate} />} bgColor={BLUE_LIGHT} />
                    <NameValueBox name={<Trans k="premium" />} value={`${symbol} ${premium}`} bgColor={BLUE_LIGHT} roundedCornersBottom={true} />
                </Box>

                <Card variant="outlined" sx={{ mt: 2, mb: 1, overflow: "visible" }}>
                    <Typography color={theme.palette.primary.main} variant="h3" sx={{ mb: 2 }} >
                        <Trans k="coverage_type.select_type" />
                    </Typography>
                    
                    {errors.type !== undefined && 
                        <Alert variant="outlined" severity="error" sx={{ mb: 2 }} data-testid="error-no-type-selected" ref={alertRef}>
                            <Trans k="error.type_not_selected" />
                        </Alert>
                    }

                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={typeWatched}
                    >
                        {coverageTypes !== null && coverageTypes.map((type) => (
                            <CoverageTypeBox 
                                details={type} 
                                key={type.type} 
                                control={control} 
                                symbol={symbol} 
                                onClick={() => cardSelected(type.type) } 
                                />
                        ))}
                    </RadioGroup>
                </Card>

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', mt: 2, pb: 2 }}>
                    <Button fullwidth type="submit">
                        <Trans k="action.continue" />
                    </Button>
                </Box>
            </form>
    {/* <DevTool control={control} /> */}
    </Box>);
}

