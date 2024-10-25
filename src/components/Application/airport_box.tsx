import { faClock, faPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Divider, SvgIcon, Typography } from "@mui/material";
import dayjs from "dayjs";
import Trans from "../Trans/trans";

export function AirportBox({ airport, time, isNextDay }: { airport: { name: string, iata: string }, time: string | null, isNextDay?: boolean }) {

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

export function ConnectionBox({ ontimepercent, carrier, flightNumber }: { ontimepercent: number | null, carrier: string, flightNumber: string }) {
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