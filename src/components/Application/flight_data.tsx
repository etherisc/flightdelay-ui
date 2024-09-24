import { faClock, faHandHoldingDollar, faPlaneArrival, faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";
import { PREMIUM_TOKEN_SYMBOL } from "../../config/constants";
import { useTranslation } from "react-i18next";

export default function FlightData() {
    const { t } = useTranslation();
    const departureAirport = useSelector((state: RootState) => state.flightData.departureAirport);
    const arrivalAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const departureTime = useSelector((state: RootState) => state.flightData.departureTime);
    const arrivalTime = useSelector((state: RootState) => state.flightData.arrivalTime);
    const ontimepercent = useSelector((state: RootState) => state.flightData.ontime);
    const premium = useSelector((state: RootState) => state.flightData.premium);

    function formatTime(date: string | null) {
        if (date === null) {
            return '';
        }
        return dayjs(date).format('HH:mm');
    }

    return <Box>
        <Grid container sx={{ mt: 4 }} spacing={1} display={{ xs: 'none', md: 'flex'}}>
            <Grid size={1}>
                <FontAwesomeIcon icon={faPlaneDeparture} />
            </Grid>
            <Grid size={3}>
                <Trans k="departureAirport" />
            </Grid>
            <Grid size={1}>
                {departureAirport}
            </Grid>
            <Grid size={1}>
                <Trans k="departureTime" />
            </Grid>
            <Grid size={6}>
                {formatTime(departureTime)}
            </Grid>
            <Grid size={1}>
                <FontAwesomeIcon icon={faPlaneArrival} />
            </Grid>
            <Grid size={3}>
                <Trans k="arrivalAirport" />
            </Grid>
            <Grid size={1}>
                {arrivalAirport}
            </Grid>
            <Grid size={1}>
                <Trans k="arrivalTime" />
            </Grid>
            <Grid size={6}>
                {formatTime(arrivalTime)}
            </Grid>
            <Grid size={1}>
                <FontAwesomeIcon icon={faClock} />
            </Grid>
            <Grid size={3}>
                <Trans k="ontimepercent" />
            </Grid>
            <Grid size={8}>
                {ontimepercent ? (ontimepercent * 100).toFixed(1) : ""}%
            </Grid>
            <Grid size={1}>
                <FontAwesomeIcon icon={faHandHoldingDollar} />
            </Grid>
            <Grid size={3}>
                <Trans k="premium" />
            </Grid>
            <Grid size={8}>
                <Typography fontWeight={700}>
                    {PREMIUM_TOKEN_SYMBOL} {premium}
                </Typography>
            </Grid>
        </Grid>
        <Grid container sx={{ mt: 4 }} spacing={1} display={{ xs: 'flex', md: 'none'}}>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneDeparture} /> {t('from')} {departureAirport} @ {formatTime(departureTime)}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneArrival} /> {t('to')} {arrivalAirport} @ {formatTime(arrivalTime)}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faHandHoldingDollar} /> <Trans k="premium" /> <Typography fontWeight={700} component="span">{PREMIUM_TOKEN_SYMBOL} {premium}</Typography>
            </Grid>
        </Grid>
    </Box>;
}