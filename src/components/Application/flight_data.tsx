import { faClock, faHandHoldingDollar, faPlane, faPlaneArrival, faPlaneDeparture, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Divider, SvgIcon, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";
import { formatAmount } from "../../utils/amount";
import { useTranslation } from "react-i18next";
import { useEnvContext } from "next-runtime-env";
import PayoutAmountsList from "./payout_amount_list";
import AirportBox from "./airport_box";

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
        const d = dayjs(date);
        return <>{d.format('HH:mm')}</>;
    }

    function nextDay(departureTime: string | null, arrivalTime: string | null) {
        if (departureTime === null || arrivalTime === null) {
            return undefined;
        }
        const d1 = dayjs(departureTime);
        const d2 = dayjs(arrivalTime);
        if (d2.isAfter(d1)) {
            return <>&nbsp;(+1 <Trans k="day" />)</>;    
        }
        return undefined;
    }

    
    return <Box>
        <Grid container spacing={1} display={{ xs: 'none', md: 'flex'}}>
            {/* <Grid size={1}>
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
                <Trans k="arrivalTime" />
                &nbsp;
                {formatTime(arrivalTime)}
                {nextDay(departureTime, arrivalTime)}
            </Grid> */}
            <Grid size={4}>
                {/* <Box sx={{ 
                        flex: 1,
                        flexGrow: 1,
                        p: 2, 
                        m: 1, 
                        border: '1px', 
                        borderRadius: 4,
                        backgroundColor: '#E3E6F060',
                        textAlign: 'center',
                    }}>
                    <Typography fontWeight={600}>
                        {departureAirport?.name} ({departureAirport?.iata})
                    </Typography>
                    
                    <Trans k="departureTime" />&nbsp;{formatTime(departureTime)}
                </Box> */}
                <AirportBox airport={departureAirport!} time={departureTime} />
            </Grid>
            <Grid size={4}>
                <Box sx={{ 
                        flex: 1,
                        flexGrow: 1,
                        p: 2,
                        pt: 3, 
                        m: 1, 
                        height: '100%',
                        // border: '1px', 
                        // borderRadius: 4,
                        // backgroundColor: '#D1E5DD',
                        textAlign: 'center',
                        alignContent: 'center',
                    }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <Divider sx={{ flex: 1, flexGrow: 1}} />
                        <SvgIcon sx={{ flex: 1, flexGrow: 1}} >
                            <FontAwesomeIcon icon={faPlane} />
                        </SvgIcon>
                        <Divider sx={{ flex: 1, flexGrow: 1}} />
                    </Box>
                    
                    {/* <SvgIcon>
                        <FontAwesomeIcon icon={faPlane} />
                    </SvgIcon> */}
                    
                    {/* <Trans k="premium" />
                    &nbsp;
                    <Typography fontWeight={700} component="span">
                        {NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(BigInt(premium!))}
                    </Typography>
                    <br /> */}
                    <Typography variant="caption">
                        <Trans k="ontimepercent" />&nbsp;
                        {ontimepercent ? (ontimepercent * 100).toFixed(1) : ""}%
                    </Typography>
                </Box>
            </Grid>
            <Grid size={4}>
                {/* <Box sx={{ 
                        flex: 1,
                        flexGrow: 1,
                        p: 2, 
                        m: 1, 
                        border: '1px', 
                        borderRadius: 4,
                        backgroundColor: '#E3E6F060',
                        textAlign: 'center',
                    }}>
                    <Typography fontWeight={600}>
                        {arrivalAirport?.name} ({arrivalAirport?.iata})
                    </Typography>
                    <Trans k="arrivalTime" />&nbsp;{formatTime(arrivalTime)}
                </Box> */}
                <AirportBox airport={arrivalAirport!} time={arrivalTime} />
            </Grid>

            <Grid size={12}>
                <PayoutAmountsList amounts={payoutAmounts} />
            </Grid>                
        </Grid>
        <Grid container sx={{ mt: 4 }} spacing={1} display={{ xs: 'flex', md: 'none'}}>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneDeparture} />
                <Typography ml={1} fontWeight={700} component="span">
                    {departureAirport?.iata}
                </Typography> 
                @ {formatTime(departureTime)}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneArrival} />
                <Typography ml={1} fontWeight={700} component="span">
                    {arrivalAirport?.iata}
                </Typography> 
                @ {formatTime(arrivalTime)} 
                {nextDay(departureTime, arrivalTime)}
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