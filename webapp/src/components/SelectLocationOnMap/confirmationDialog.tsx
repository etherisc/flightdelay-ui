import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Button, NameValueBox, Trans } from 'component-lib';
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import BackButton from "../(basic_widgets)/BackButton/back_button";
import { BLUE_LIGHT, HEIGHT_BOTTOM_NAV, ZINDEX_SIGNUP_CONFIRMATION_DIALOG } from "../../config/theme";
import { setEndDate } from "../../redux/slices/application";
import { setStep } from "../../redux/slices/signup";
import { AppDispatch, RootState } from "../../redux/store";
import { SIGNUP_STEP_PREMIUM_AMOUNT, SIGNUP_STEP_SELECT_LOCATION } from "../../utils/step_constants";
import { loadPayoutScale, loadPremiumData } from "../../redux/thunks/signup";
import { useSwipeable } from "react-swipeable";
import { useEffect } from "react";
import { ConfirmationDialogMap } from "./confirmation_dialog_map";
import Coordinates from "../(basic_widgets)/Coordinates/coordinates";
import { useAnalytics } from "../../hooks/use_analytics";


export default function ConfirmationDialog() {
    const theme = useTheme();
    const dispatch = useDispatch() as AppDispatch;
    const handlers = useSwipeable({
        onSwipedDown: back,
        ...{
            delta: 50,                             // min distance(px) before a swipe starts. *See Notes*
            preventScrollOnSwipe: false,           // prevents scroll during swipe (*See Details*)
            trackTouch: true,                      // track touch input
            trackMouse: false,                     // track mouse input
            rotationAngle: 0,                      // set a rotation angle
            swipeDuration: Infinity,               // allowable duration of a swipe (ms). *See Notes*
            touchEventOptions: { passive: true },  // options for touch listeners (*See Details*)
        }});
    const { trackPageView } = useAnalytics();

    const locationId = useSelector((state: RootState) => (state.application.locationId));
    const locationName = useSelector((state: RootState) => (state.application.locationName));
    const locationCoords = useSelector((state: RootState) => (state.application.locationCoordinates));
    const errorFetchingPremium = useSelector((state: RootState) => (state.signup.premiumDataFetchFailedReason));
    const errorFetchingPayoutScale = useSelector((state: RootState) => (state.signup.payoutScaleFetchFailedReason));
    
    function back() {
        dispatch(setStep(SIGNUP_STEP_SELECT_LOCATION));
    }

    function confirm() {
        dispatch(setEndDate(dayjs().add(1, 'year').unix()));
        dispatch(setStep(SIGNUP_STEP_PREMIUM_AMOUNT));
    }

    /* fetch premium data and payout scales in advance (we assume the user will continue here or in worst case fetch again) to avoid delay later on in the process */
    useEffect(() => {
        dispatch(loadPremiumData(locationId));
        dispatch(loadPayoutScale({ locationId }));
    }, [dispatch, locationId]);

    useEffect(() => {
        trackPageView("signup - confirm city", "/signup/confirm_selection");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return (
        <Card sx={{ 
            position: 'absolute', 
            top: 120,
            bottom: HEIGHT_BOTTOM_NAV, 
            left: 0, 
            right: 0,
            ml: 'auto',
            mr: 'auto',
            zIndex: ZINDEX_SIGNUP_CONFIRMATION_DIALOG, 
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: 'white',
            maxWidth: 'sm',
        }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Box sx={{ display: 'flex', alignItems: 'baseline'}} {...handlers}>
                    <BackButton onClick={back} />
                    <Typography color={theme.palette.primary.main} variant="h2" sx={{ ml: 2 }}>
                        <Trans k="confirm_selection.title" />
                    </Typography>
                </Box>

                { (errorFetchingPayoutScale !== null || errorFetchingPremium !== null) &&
                    <Box sx={{ mt: 2, mx: 2, display: 'flex', alignItems: 'baseline'}}>
                        <Alert variant="outlined" severity="error" sx={{ mb: 2 }} data-testid="error-no-type-selected">
                            <Trans k="error.error_fetching_location_data" />
                        </Alert>
                    </Box>
                }

                <Box sx={{ mt: 2, mx: 2, display: 'flex', alignItems: 'baseline'}} data-testid="policy-calculation-hint">
                    <Typography>
                        <Trans k="confirmation_hint_policy_calculation" values={{ location: locationName }} />
                    </Typography>
                </Box>

                <Box sx={{ mt: 2, mx: 2, height: '100%' }}>
                    <ConfirmationDialogMap lat={locationCoords.lat} lng={locationCoords.lng} />
                </Box>

                <Box sx={{ mt: 2, ml: 2, mr: 2, display: 'flex', flexDirection: 'column', gap: 0.25 }} data-testid="confirmation-values">
                    <NameValueBox name={<Trans k="location" />} value={locationName} bgColor={BLUE_LIGHT} roundedCornersTop={true} />
                    <NameValueBox name={<Trans k="coordinates" />} value={<Coordinates lat={locationCoords.lat} lng={locationCoords.lng}/>} bgColor={BLUE_LIGHT} roundedCornersBottom={true} />
                </Box>

                <Box sx={{ mt: 2, ml: 2, mr: 2, flexGrow: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                        <Button onClick={confirm} fullwidth disabled={(errorFetchingPayoutScale !== null || errorFetchingPremium !== null)}>
                            <Trans k="action.continue" />
                        </Button>
                </Box>
            </CardContent>
        </Card>);
}
