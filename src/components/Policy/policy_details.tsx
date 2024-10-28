import { faPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Divider, SvgIcon, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PayoutAmounts } from "../../redux/slices/flightData";
import { getFlightStateText } from "../../utils/flightstate";
import PayoutAmountsList from "./payout_amount_list";

export default function PolicyDetails({
    departureAirport,
    arrivalAirport,
    departureTime,
    arrivalTime,
    premium,
    payoutAmounts,
    carrier,
    flightNumber,
    flightState,
    delay,
}: {
    departureAirport: { name: string, iata: string, whitelisted: boolean },
    arrivalAirport: { name: string, iata: string, whitelisted: boolean },
    departureTime: string,
    arrivalTime: string,
    ontimepercent: number,
    premium: number,
    payoutAmounts: PayoutAmounts,
    carrier: string,
    flightNumber: string,
    flightState: string,
    delay: number
}) {
    const showPremium = premium !== null && premium > 0 && (arrivalAirport?.whitelisted == true || departureAirport?.whitelisted);
    
    const boxRef = useRef(null);

    useEffect(() => {
        // @ts-expect-error: scrollIntoView is a valid function
        boxRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return <Box>
        <Grid container display="flex">
            <Grid size={4} ref={boxRef}>
                <AirportBox airport={departureAirport!} time={departureTime} />
            </Grid>
            <Grid size={4}>
                <ConnectionBox carrier={carrier!} flightNumber={flightNumber!} flightState={flightState} delay={delay} departureTimeUtc={dayjs(departureTime).utc().unix()} />
            </Grid>
            <Grid size={4}>
                <AirportBox airport={arrivalAirport!} time={arrivalTime} />
            </Grid>
            {showPremium && <Grid size={12}>
                <PayoutAmountsList amounts={payoutAmounts} />
            </Grid>}       
        </Grid>
    </Box>;
}

function AirportBox({ airport, time}: { airport: { name: string, iata: string }, time: string | null }) {

    function formatTime(date: string | null) {
        if (date === null) {
            return '';
        }
        const d = dayjs(date);
        return <>{d.format('YYYY-MM-DD HH:mm')}</>;
    }

    return <>
        {/* desktop view */}
        <Box sx={{ 
                display: { xs: 'none', md: 'block'},
                p: 2, 
                m: 1, 
                height: '100%',
                textAlign: 'center',
                alignContent: 'center',
            }}>
            <Typography fontWeight={500}>
                {airport?.name} ({airport?.iata})
            </Typography>
            {formatTime(time)}
        </Box>
        {/* mobile view */}
        <Box sx={{
                display: { xs: 'block', md: 'none'},
                p: 2, 
                height: '100%',
                textAlign: 'center',
                alignContent: 'center',
            }}>
            <Typography fontWeight={500}>
                {airport?.iata}
            </Typography>
            {formatTime(time)}
        </Box>
    </>;
}

function ConnectionBox(
    { carrier, flightNumber, flightState, departureTimeUtc, delay }: 
    { carrier: string, flightNumber: string, flightState: string, departureTimeUtc: number, delay: number 
}) {
    const { t } = useTranslation();
    const { text, color } = getFlightStateText(flightState, departureTimeUtc, delay, t);

    return <>
        {/* desktop view */}
        <Box sx={{ 
                display: { xs: 'none', md: 'block'},
                flex: 1,
                flexGrow: 1,
                p: 2,
                pt: 3, 
                m: 1, 
                height: '100%',
                textAlign: 'center',
                alignContent: 'center',
            }}>
            <Typography variant="caption">
                {carrier} {flightNumber}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <Divider sx={{ flex: 1, flexGrow: 1}} />
                <SvgIcon sx={{ flex: 1, flexGrow: 1}} >
                    <FontAwesomeIcon icon={faPlane} />
                </SvgIcon>
                <Divider sx={{ flex: 1, flexGrow: 1}} />
            </Box>
            <Typography color={color} sx={{ pt: 1 }}>
                {text}
            </Typography>
        </Box>
        {/* mobile view */}
        <Box sx={{ 
                display: { xs: 'block', md: 'none'},
                flex: 1,
                flexGrow: 1,
                height: '100%',
                textAlign: 'center',
                alignContent: 'center',
            }}>
            <Typography variant="caption">
                {carrier} {flightNumber}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <SvgIcon sx={{ flex: 1, flexGrow: 1}} >
                    <FontAwesomeIcon icon={faPlane} />
                </SvgIcon>
            </Box>
            <Typography color={color} sx={{ lineHeight: 0.5, pt: 1 }}>
                {text}
            </Typography>
        </Box>
    </>
}