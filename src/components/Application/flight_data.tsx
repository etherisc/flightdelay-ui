import { faClock, faHandHoldingDollar, faPlaneArrival, faPlaneDeparture, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";
import { formatAmount } from "../../utils/amount";
import { useTranslation } from "react-i18next";
import { useEnvContext } from "next-runtime-env";

export default function FlightData() {
    const { t } = useTranslation();
    const departureAirport = useSelector((state: RootState) => state.flightData.departureAirport);
    const arrivalAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const departureTime = useSelector((state: RootState) => state.flightData.departureTime);
    const arrivalTime = useSelector((state: RootState) => state.flightData.arrivalTime);
    const ontimepercent = useSelector((state: RootState) => state.flightData.ontime);
    const premium = useSelector((state: RootState) => state.flightData.premium);
    const payoutAmounts = useSelector((state: RootState) => state.flightData.payoutAmounts);
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();

    const showPremium = premium !== null && premium > 0 && (arrivalAirport?.whitelisted == true || departureAirport?.whitelisted);

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
            <Grid size={2}>
                <Trans k="departureAirport" />
            </Grid>
            <Grid size={4}>
                <Typography fontWeight={700}>
                    {departureAirport?.name} ({departureAirport?.iata})
                </Typography>
            </Grid>
            <Grid size={5}>
            <Trans k="departureTime" />&nbsp;{formatTime(departureTime)}
            </Grid>
            <Grid size={1}>
                <FontAwesomeIcon icon={faPlaneArrival} />
            </Grid>
            <Grid size={2}>
                <Trans k="arrivalAirport" />
            </Grid>
            <Grid size={4}>
                <Typography fontWeight={700}>
                    {arrivalAirport?.name} ({arrivalAirport?.iata})
                </Typography>
            </Grid>
            <Grid size={5}>
                <Trans k="arrivalTime" />&nbsp;{formatTime(arrivalTime)}
            </Grid>
            {showPremium && <>
                <Grid size={1}>
                    <FontAwesomeIcon icon={faClock} />
                </Grid>
                <Grid size={2}>
                    <Trans k="ontimepercent" />
                </Grid>
                <Grid size={9}>
                    {ontimepercent ? (ontimepercent * 100).toFixed(1) : ""}%
                </Grid>
                <Grid size={1}>
                    <FontAwesomeIcon icon={faHandHoldingDollar} />
                </Grid>
                <Grid size={2}>
                    <Trans k="premium" />
                </Grid>
                <Grid size={9}>
                    <Typography fontWeight={700}>
                        {NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(BigInt(premium!))}
                    </Typography>
                </Grid>
                <Grid size={1}>
                    <FontAwesomeIcon icon={faSackDollar} />
                </Grid>
                <Grid size={2}>
                    <Trans k="payout" />
                </Grid>
                <Grid size={9}>
                    {t('delayed')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(payoutAmounts?.delayed)}</Typography>
                    / 
                    {t('cancelled')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(payoutAmounts?.cancelled)}</Typography>
                    / 
                    {t('diverted')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(payoutAmounts?.diverted)}</Typography>
                </Grid>
            </>}
        </Grid>
        <Grid container sx={{ mt: 4 }} spacing={1} display={{ xs: 'flex', md: 'none'}}>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneDeparture} /><Typography ml={1} fontWeight={700} component="span">{departureAirport?.iata}</Typography> @ {formatTime(departureTime)}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneArrival} /><Typography ml={1} fontWeight={700} component="span">{arrivalAirport?.iata}</Typography> @ {formatTime(arrivalTime)}
            </Grid>
            {showPremium && <>
                <Grid size={12}>
                    <FontAwesomeIcon icon={faHandHoldingDollar} />&nbsp;&nbsp;<Trans k="premium" /> <Typography fontWeight={700} component="span">{formatAmount(BigInt(premium!))}</Typography>
                </Grid>
                <Grid size={12}>
                    <FontAwesomeIcon icon={faSackDollar} />&nbsp;&nbsp;
                    {t('delayed')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(payoutAmounts?.delayed)}</Typography>
                    / 
                    {t('cancelled')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(payoutAmounts?.cancelled)}</Typography>
                    / 
                    {t('diverted')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(payoutAmounts?.diverted)}</Typography>
                </Grid>
            </>}
        </Grid>
    </Box>;
}