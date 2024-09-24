import { faPlaneArrival, faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, LinearProgress, Typography } from "@mui/material";
import { blue, green, grey, red } from "@mui/material/colors";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { FlightState, PolicyData } from "../../types/policy_data";

export default function PoliciesListMobile({ policies, loading }: { policies: PolicyData[], loading: boolean }) {

    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    return (<>
        {loadingIndicator}
        {policies.map((policy) => {
            return <Policy policy={policy} key={policy.nftId} />
        })}
    </>);
}

function Policy({ policy }: { policy: PolicyData }) {
    const { t } = useTranslation();

    function formatState(policy: PolicyData) {
        let text;
        let color = grey[900] as string;
        let additional = undefined;
        const state = policy.flightState;
        switch (state) {
            case FlightState.SCHEDULED:
                text = t('flight_state.scheduled');
                break;
            case FlightState.EN_ROUTE:
                text = t('flight_state.en_route');
                color = blue[600];
                break;
            case FlightState.PUNCTUAL:
                text = t('flight_state.punctual');
                color = green[600];
                additional = <>{t('actual_arrival')}: {dayjs(policy.flightData?.actualArrivalTime).format('HH:mm')}</>;
                break;
            case FlightState.DELAYED:
                text = t('flight_state.delayed');
                additional = <>{t('actual_arrival')}: {dayjs(policy.flightData?.actualArrivalTime).format('HH:mm')}</>;
                color = red[500];
                break;
            case FlightState.CANCELLED:
                text = t('flight_state.cancelled');
                break;
            case FlightState.DIVERTED:
                text = t('flight_state.diverted');
                break;
        }
        return <Typography color={color} variant="body2">
            {text}
            {additional !== undefined ? <><br/>{additional}</> : null}
        </Typography>;
    }

    function formatTime(date: string | undefined) {
        if (date === undefined) {
            return '';
        }
        return dayjs(date).format('HH:mm');
    }
    
    return (<Box sx={{ pb: 1, mb: 1, borderBottom: '1px solid', borderBottomColor: grey[300] }}>
        <Grid container spacing={1}>
            <Grid size={6}>
                {t("table.header.nftId")}: {policy.nftId}
            </Grid>
            <Grid size={6} sx={{ textAlign: 'right'}}>
                {t('flight')}: {policy.carrier} {policy.flightNumber}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneDeparture} /> {t('from')} {policy.flightData?.departureAirportFsCode} @ {formatTime(policy.flightData?.publishedDepartureTime)}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneArrival} /> {t('to')} {policy.flightData?.arrivalAirportFsCode} @ {formatTime(policy.flightData?.publishedArrivalTime)}
            </Grid>
            <Grid size={12}>
                {formatState(policy)}
            </Grid>
        </Grid>
    </Box>);
}