import { faClock, faPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Divider, SvgIcon, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { PayoutAmounts } from "../../redux/slices/flightData";
import Trans from "../Trans/trans";
import PayoutAmountsList from "./payout_amount_list";

export default function FlightData({
    departureAirport,
    arrivalAirport,
    departureTime,
    arrivalTime,
    ontimepercent,
    premium,
    payoutAmounts,
    carrier,
    flightNumber
}: {
    departureAirport: { name: string, iata: string, whitelisted: boolean },
    arrivalAirport: { name: string, iata: string, whitelisted: boolean },
    departureTime: string,
    arrivalTime: string,
    ontimepercent: number,
    premium: number,
    payoutAmounts: PayoutAmounts,
    carrier: string,
    flightNumber: string
}) {
    const showPremium = premium !== null && premium > 0 && (arrivalAirport?.whitelisted == true || departureAirport?.whitelisted);
    const isArrivalNextDay = dayjs(arrivalTime).day() !== dayjs(departureTime).day();
    
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
                <ConnectionBox ontimepercent={ontimepercent} carrier={carrier!} flightNumber={flightNumber!} />
            </Grid>
            <Grid size={4}>
                <AirportBox airport={arrivalAirport!} time={arrivalTime} isNextDay={isArrivalNextDay} />
            </Grid>
            {showPremium && <Grid size={12}>
                <PayoutAmountsList amounts={payoutAmounts} />
            </Grid>}       
        </Grid>
    </Box>;
}

function AirportBox({ airport, time, isNextDay }: { airport: { name: string, iata: string }, time: string | null, isNextDay?: boolean }) {

    function formatTime(date: string | null) {
        if (date === null) {
            return '';
        }
        const d = dayjs(date);
        return <>{d.format('HH:mm')}</>;
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
            @&nbsp;{formatTime(time)} {isNextDay && <>&nbsp;(+1 <Trans k="day" />)</>}
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
            
            {isNextDay && 
                <Typography variant="caption" component="div">(+1d)</Typography>}
        </Box>
    </>;
}

function ConnectionBox({ ontimepercent, carrier, flightNumber }: { ontimepercent: number | null, carrier: string, flightNumber: string }) {
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
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <Divider sx={{ flex: 1, flexGrow: 1}} />
                <SvgIcon sx={{ flex: 1, flexGrow: 1}} >
                    <FontAwesomeIcon icon={faPlane} />
                </SvgIcon>
                <Divider sx={{ flex: 1, flexGrow: 1}} />
            </Box>
            <Typography variant="caption">
                <Trans k="ontimepercent" />&nbsp;
                {ontimepercent ? (ontimepercent * 100).toFixed(0) : ""}%
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
            <Typography variant="caption" sx={{ lineHeight: 0.5 }}>
                <FontAwesomeIcon icon={faClock} />
                &nbsp;
                {ontimepercent ? (ontimepercent * 100).toFixed(0) : ""}%
            </Typography>
        </Box>
    </>
}