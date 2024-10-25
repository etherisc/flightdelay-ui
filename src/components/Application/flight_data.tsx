import { Box } from "@mui/material";
import Grid from '@mui/material/Grid2';
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
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
    const carrier = useSelector((state: RootState) => state.flightData.carrier);
    const flightNumber = useSelector((state: RootState) => state.flightData.flightNumber);

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