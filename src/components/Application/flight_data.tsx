import { faPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Divider, SvgIcon, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";
import { AirportBox, ConnectionBox } from "./airport_box";
import PayoutAmountsList from "./payout_amount_list";

export default function FlightData() {
    const departureAirport = useSelector((state: RootState) => state.flightData.departureAirport);
    const arrivalAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const departureTime = useSelector((state: RootState) => state.flightData.departureTime);
    const arrivalTime = useSelector((state: RootState) => state.flightData.arrivalTime);
    const ontimepercent = useSelector((state: RootState) => state.flightData.ontime);
    const premium = useSelector((state: RootState) => state.flightData.premium);
    const payoutAmounts = useSelector((state: RootState) => state.flightData.payoutAmounts);

    const showPremium = premium !== null && premium > 0 && (arrivalAirport?.whitelisted == true || departureAirport?.whitelisted);

    // FIXME: thats still missing
    // function nextDay(departureTime: string | null, arrivalTime: string | null) {
    //     if (departureTime === null || arrivalTime === null) {
    //         return undefined;
    //     }
    //     const d1 = dayjs(departureTime);
    //     const d2 = dayjs(arrivalTime);
    //     if (d2.isAfter(d1)) {
    //         return <>&nbsp;(+1 <Trans k="day" />)</>;    
    //     }
    //     return undefined;
    // }
    
    return <Box>
        <Grid container display={{ xs: 'none', md: 'flex'}}>
            <Grid size={4}>
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
                        {ontimepercent ? (ontimepercent * 100).toFixed(1) : ""}%
                    </Typography>
                </Box>
            </Grid>
            <Grid size={4}>
                <AirportBox airport={arrivalAirport!} time={arrivalTime} />
            </Grid>

            <Grid size={12}>
                <PayoutAmountsList amounts={payoutAmounts} />
            </Grid>                
        </Grid>
        <Grid container display={{ xs: 'flex', md: 'none'}}>
            <Grid size={4}>
                <AirportBox airport={departureAirport!} time={departureTime} />
            </Grid>
            <Grid size={4}>
                <ConnectionBox ontimepercent={ontimepercent} />
            </Grid>
            <Grid size={4}>
                <AirportBox airport={arrivalAirport!} time={arrivalTime} />
            </Grid>
            {showPremium && <>
                <Grid size={12}>
                    <PayoutAmountsList amounts={payoutAmounts} />
                </Grid>
            </>}
        </Grid>
    </Box>;
}