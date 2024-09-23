import { faCartShopping, faWallet } from "@fortawesome/free-solid-svg-icons";
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
import useApplication from "../../hooks/use_application";

export default function Application() {
    const { connectWallet } = useWallet();
    const { purchaseProtection, purchaseProtectionError } = useApplication();
    const errorReason = useSelector((state: RootState) => state.flightData.errorReason);
    const departureAirport = useSelector((state: RootState) => state.flightData.departureAirport);
    const isDepartureAirportWhiteListed = useSelector((state: RootState) => state.flightData.departureAirportWhitelisted);
    const arrivalAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const isArrivalAirportWhiteListed = useSelector((state: RootState) => state.flightData.arrivalAirportWhitelisted);
    const loadingFlightData = useSelector((state: RootState) => state.flightData.loading);
    const loadingQuote = useSelector((state: RootState) => state.flightData.loadingQuote);
    const flightFound = useSelector((state: RootState) => state.flightData.arrivalAirport !== null);
    const walletIsConnected = useSelector((state: RootState) => state.wallet.address !== null);
    
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

    let button = <Button color="primary" fullwidth onClick={connectWallet}>
        <SvgIcon sx={{ mr: 1 }} fontSize="small">
            <FontAwesomeIcon icon={faWallet} />
        </SvgIcon>
        <Trans k="action.connect" />
    </Button>;
    if (walletIsConnected) {
        button = <Button color="primary" fullwidth onClick={purchaseProtection}>
            <SvgIcon sx={{ mr: 1 }} fontSize="small">
                <FontAwesomeIcon icon={faCartShopping} />
            </SvgIcon>
            <Trans k="action.purchase" />
        </Button>;
    }

    let purchaseProtectionErrorMsg = <></>;
    if (purchaseProtectionError !== null) {
        purchaseProtectionErrorMsg = <Box sx={{ py: 2 }}>
            <Alert severity="warning">{purchaseProtectionError}</Alert>
        </Box>;
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
                {purchaseProtectionErrorMsg}
            </CardContent>
            <CardActions>
                {button}
            </CardActions>
        </Card>
    </>);
}