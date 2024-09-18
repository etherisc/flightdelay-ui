import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import BackButton from "../(basic_widgets)/BackButton/back_button";
import Card from "../(basic_widgets)/Card/card";
import Date from "../(basic_widgets)/Date/date";
import { BLUE_LIGHT } from "../../config/theme";
import { CoverageType } from "../../types/coverage_type";
import useCalculateSumInsured from "../../hooks/use_calculate_sum_insured";
import { setPremium } from "../../redux/slices/application";
import { CoverageTypeDetails, setStep, setSumInsured } from "../../redux/slices/signup";
import { AppDispatch, RootState } from "../../redux/store";
import { SIGNUP_STEP_CONFIRM_LOCATION, SIGNUP_STEP_COVERAGE_TYPE } from "../../utils/step_constants";
import Form from "./form";
import { useEffect } from "react";
import { useAnalytics } from "../../hooks/use_analytics";
import Trans from "../Trans/trans";
import NameValueBox from "../NameValueBox/name_value_box";
import Button from "../Button/button";
// import { DevTool } from "@hookform/devtools";

export type IPremiumAmountFormValues = {
    amount: string;
};

export default function EnterPremiumAmount() {
    const theme = useTheme();
    const dispatch = useDispatch() as AppDispatch;
    const { trackPageView } = useAnalytics();

    const locationName = useSelector((state: RootState) => (state.application.locationName));
    const endDate = useSelector((state: RootState) => (state.application.endDate));
    const availableTypes = useSelector((state: RootState) => (state.signup.availableTypes));
    const symbol = useSelector((state: RootState) => (state.common.tokenSymbol));
    const minimumPremium = Math.min(...availableTypes.map((type: CoverageTypeDetails) => (type.minimumPremium)));
    const maximumPremium = Math.max(...availableTypes.map((type: CoverageTypeDetails) => (type.maximumPremium)));
    const fragileShieldPayoutFactor = availableTypes.find((type: CoverageTypeDetails) => (type.type === CoverageType.FragileShield))?.ratio ?? 0;
    const homeGuardPayoutFactor = availableTypes.find((type: CoverageTypeDetails) => (type.type === CoverageType.HomeGuard))?.ratio ?? 0;

    const { handleSubmit, control, formState, watch } = useForm<IPremiumAmountFormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
        defaultValues: {
            amount: minimumPremium.toString(),
        }
    });

    useEffect(() => {
        trackPageView("signup - enter amount", "/signup/enter_amount");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const watchedAmount = watch('amount');
    const { sumInsuredFragileShield, sumInsuredHomeGuard } = useCalculateSumInsured(watchedAmount, fragileShieldPayoutFactor, homeGuardPayoutFactor);

    function back() {
        dispatch(setStep(SIGNUP_STEP_CONFIRM_LOCATION));
    }

    const onSubmit: SubmitHandler<IPremiumAmountFormValues> = (data) => {
        const amount = data.amount;
        // console.log(amount);
        dispatch(setPremium(parseInt(amount)));
        dispatch(setSumInsured({ type: CoverageType.FragileShield, sumInsured: sumInsuredFragileShield}));
        dispatch(setSumInsured({ type: CoverageType.HomeGuard, sumInsured: sumInsuredHomeGuard }));
        dispatch(setStep(SIGNUP_STEP_COVERAGE_TYPE));
    };

    return (<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', alignItems: 'baseline'}}>
                <BackButton onClick={back} />
                <Typography color={theme.palette.primary.main} variant="h2" sx={{ ml: 2 }}>
                    <Trans k="enter_premium_amount.title" />
                </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.25 }} data-testid="offer-values">
                <NameValueBox name={<Trans k="location" />} value={locationName} bgColor={BLUE_LIGHT} roundedCornersTop={true} />
                <NameValueBox name={<Trans k="policy_end_date" />} value={<Date timestamp={endDate} />} bgColor={BLUE_LIGHT} roundedCornersBottom={true} />
            </Box>

            <Card sx={{ mt: 2 }}>
                <Typography color={theme.palette.primary.main} variant="h3" sx={{ mb: 2 }} >
                    <Trans k="enter_premium_amount.enter_amount" />
                </Typography>
                <Form control={control} formState={formState} minimumPremium={minimumPremium} maximumPremium={maximumPremium} symbol={symbol} />
                <Typography sx={{ my: 2 }} >
                    <Trans k="enter_premium_amount.available_insurances" />
                </Typography>
                {availableTypes.map((type: CoverageTypeDetails) => {
                    const sumInsured = type.type === CoverageType.FragileShield ? sumInsuredFragileShield : sumInsuredHomeGuard;
                    return (
                        <Box 
                            key={type.type}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'baseline',
                                px: 2, py: 1, 
                                mb: 0.5,
                                borderRadius: 2,
                                backgroundColor: BLUE_LIGHT, 
                            }}>
                            <Typography sx={{ flexGrow: 0 }} color="primary" component="span">
                                <Trans k={`protection_type_names.${type.type}`} />
                            </Typography>
                            <Typography sx={{ flexGrow: 1, textAlign: 'right' }} component="span" data-testid={`sum-insured-${type.type}`}>
                                {symbol} {sumInsured}
                            </Typography>
                        </Box>);
                })}
            </Card>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                <Button fullwidth type="submit">
                    <Trans k="action.continue" />
                </Button>
            </Box>
        </Box>
        {/* <DevTool control={control} /> */}
    </form>);
}
