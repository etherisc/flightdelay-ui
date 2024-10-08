import { faPlaneArrival, faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, LinearProgress, Typography } from "@mui/material";
import { blue, green, grey } from "@mui/material/colors";
import Grid from '@mui/material/Grid2';
import { useTranslation } from "react-i18next";
import { FlightPlan } from "../../types/flight_plan";
import { PolicyData } from "../../types/policy_data";
import { RiskData } from "../../types/risk_data";
import { dayjs } from "../../utils/date";

export default function PoliciesListMobile({ policies, risks, loading }: { policies: PolicyData[], risks: RiskData[], loading: boolean }) {

    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    return (<>
        {loadingIndicator}
        {policies.map((policy) => {
            return <Policy policy={policy} risk={risks.find(risk => risk.riskId === policy.riskId)} key={policy.nftId} />
        })}
    </>);
}

function Policy({ policy, risk }: { policy: PolicyData, risk: RiskData | undefined }) {
    const { t } = useTranslation();

    function formatState(flightPlan: FlightPlan) {
        let text;
        let color = grey[900] as string;
        const additional = undefined;
        const state = flightPlan.status;
        switch (state) {
            case 'S': // scheduled
                text = t('flight_state.scheduled');
                break;
            case 'A': // active
                text = t('flight_state.en_route');
                color = blue[600];
                break;
            case 'L': // landed
                text = t('flight_state.punctual');
                color = green[600];
                // TODO: fixme
                // additional = <>{t('actual_arrival')}: {dayjs(flightData?.actualArrivalTime).format('HH:mm')}</>;
                break;
            // TODO: implement by reading delay
            // case 'L':
            //     text = t('flight_state.delayed');
            //     additional = <>{t('actual_arrival')}: {dayjs(flightData?.actualArrivalTime).format('HH:mm')}</>;
            //     color = red[500];
            //     break;
            case 'C': // cancelled
                text = t('flight_state.cancelled');
                break;
            case 'D': // diverted
                text = t('flight_state.diverted');
                break;
        }
        return <Typography color={color} variant="body2">
            {text}
            {additional !== undefined ? <><br/>{additional}</> : null}
        </Typography>;
    }

    // function formatTime(date: string | null | undefined) {
    //     if (date === undefined || date === null) {
    //         return '';
    //     }
    //     return dayjs(date).format('HH:mm');
    // }

    if (risk === undefined) {
        return (<Box sx={{ pb: 1, mb: 1, borderBottom: '1px solid', borderBottomColor: grey[300] }}>
            <Grid container spacing={1}>
                <Grid size={6}>
                    {t("table.header.nftId")}: {policy.nftId}
                </Grid>
            </Grid>
        </Box>);
    }
    
    let departure = undefined;
    let arrival = undefined;

    if (risk.flightPlan !== null) {
        departure = dayjs.tz(risk.flightPlan.departureTimeLocal, risk.flightPlan.departureTimeLocalTimezone!);
        arrival = dayjs.tz(risk.flightPlan.arrivalTimeLocal, risk.flightPlan.arrivalTimeLocalTimezone!);
    }

    return (<Box sx={{ pb: 1, mb: 1, borderBottom: '1px solid', borderBottomColor: grey[300] }}>
        <Grid container spacing={1}>
            <Grid size={6}>
                {t("table.header.nftId")}: {policy.nftId}
            </Grid>
            <Grid size={6} sx={{ textAlign: 'right'}}>
                <b>{t('flight')}: {risk.carrier} {risk.flightNumber}</b>
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneDeparture} /> {t('from')} {risk.flightPlan?.departureAirportFsCode} @ {departure?.format('HH:mm')}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneArrival} /> {t('to')} {risk.flightPlan?.arrivalAirportFsCode} @ {arrival?.format('HH:mm')}
            </Grid>
            <Grid size={12}>
                {formatState(risk.flightPlan!)}
            </Grid>
        </Grid>
    </Box>);
}