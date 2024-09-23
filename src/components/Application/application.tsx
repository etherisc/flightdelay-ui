import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, Card, CardActions, CardContent, CardHeader, LinearProgress, SvgIcon } from "@mui/material";
import Image from "next/image";
import Button from "../Button/button";
import { useWallet } from "../../hooks/onchain/use_wallet";
import ApplicationForm from "./application_form";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";
import FlightData from "./flight_data";

export default function Application() {
    const { connectWallet } = useWallet();
    const errorReason = useSelector((state: RootState) => state.flightData.errorReason);
    const departureAirport = useSelector((state: RootState) => state.flightData.departureAirport);
    const isDepartureAirportWhiteListed = useSelector((state: RootState) => state.flightData.departureAirportWhitelisted);
    const arrivalAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const isArrivalAirportWhiteListed = useSelector((state: RootState) => state.flightData.arrivalAirportWhitelisted);
    const loadingFlightData = useSelector((state: RootState) => state.flightData.loading);
    const loadingQuote = useSelector((state: RootState) => state.flightData.loadingQuote);
    const flightFound = useSelector((state: RootState) => state.flightData.arrivalAirport !== null);
    
    let error = <></>;

    if (errorReason !== null) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error"><Trans k="error.no_flight_found" /></Alert>
        </Box>;
    } else if (! isDepartureAirportWhiteListed) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error"><Trans k="error.departure_airport_not_whitelisted" values={{ airport: departureAirport }} /></Alert>
        </Box>;
    } else if (! isArrivalAirportWhiteListed) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error"><Trans k="error.arrival_airport_not_whitelisted" values={{ airport: arrivalAirport }} /></Alert>
        </Box>;
    }

    let flightDataLoading = <></>;
    if (loadingFlightData || loadingQuote) {
        flightDataLoading = <LinearProgress />;
    }

    let flightData = <></>;
    if (flightFound) {
        flightData = <FlightData />;
    }

    return (<>
        <Card>
            <CardHeader
                avatar={
                    <Image src="/assets/images/etherisc_logo_bird_blue.svg" alt="Etherisc Logo" height={64} width={64} />
                    }
                title="Etherisc Flightdelay Protection"
                    />
            <CardContent>
                <ApplicationForm />
                {error}
                {flightDataLoading}
                {flightData}
            </CardContent>
            <CardActions>
                {/* TODO: only show connect button when wallet not connected */}
                <Button color="primary" fullwidth onClick={connectWallet}>
                    <SvgIcon sx={{ mr: 1 }} fontSize="small">
                        <FontAwesomeIcon icon={faWallet} />
                    </SvgIcon>
                    Connect wallet
                </Button>
            </CardActions>
        </Card>
    </>);
}