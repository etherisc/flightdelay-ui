import { faClock, faHandHoldingDollar, faPlaneArrival, faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useConstants } from "../../hooks/use_constants";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";

export default function FlightData() {
    const { PREMIUM_TOKEN_SYMBOL } = useConstants();
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
        <Grid container sx={{ mt: 4 }} spacing={1}>
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
        <Box>

        </Box>
    </Box>;
}