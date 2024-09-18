import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import BackButton from "../(basic_widgets)/BackButton/back_button";
import Card from "../(basic_widgets)/Card/card";
import Date from "../(basic_widgets)/Date/date";
import { BLUE_LIGHT } from "../../config/theme";
import { setStep } from "../../redux/slices/signup";
import { RootState } from "../../redux/store";
import { SIGNUP_STEP_CONFIRM_LOCATION, SIGNUP_STEP_COVERAGE_TYPE } from "../../utils/step_constants";
import Form, { ICoverageAmountFormValues } from "./form";
// import { DevTool } from "@hookform/devtools";

/** @deprecated don't use any more */
export default function EnterCoverageAmount() {
    const theme = useTheme();
    const dispatch = useDispatch();

    const { handleSubmit, control, formState } = useForm<ICoverageAmountFormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
        defaultValues: {
            amount: "50000",
        }
    });

    function back() {
        dispatch(setStep(SIGNUP_STEP_CONFIRM_LOCATION));
    }

    const onSubmit: SubmitHandler<ICoverageAmountFormValues> = () => {
        // const amount = data.amount;
        // dispatch(setAmount(parseInt(amount)));
        dispatch(setStep(SIGNUP_STEP_COVERAGE_TYPE));
    };

    const locationName = useSelector((state: RootState) => (state.application.locationName));
    const endDate = useSelector((state: RootState) => (state.application.endDate));

    return (<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', alignItems: 'baseline'}}>
                <BackButton onClick={back} />
                <Typography color={theme.palette.primary.main} variant="h2" sx={{ ml: 2 }}>
                    <Trans k="coverage_amount_form.title" />
                </Typography>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 0.25 }} data-testid="offer-values">
                <NameValueBox name={<Trans k="location" />} value={locationName} bgColor={BLUE_LIGHT} roundedCornersTop={true} />
                <NameValueBox name={<Trans k="policy_end_date" />} value={<Date timestamp={endDate} />} bgColor={BLUE_LIGHT} roundedCornersBottom={true} />
            </Box>

            <Card sx={{ mt: 2 }}>
                <Typography color={theme.palette.primary.main} variant="h3" sx={{ mb: 2 }} >
                    <Trans k="coverage_amount_form.enter_amount" />
                </Typography>
                <Form control={control} formState={formState} />
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
