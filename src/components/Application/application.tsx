import { faCartShopping, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, AlertColor, Box, Card, CardActions, CardContent, CardHeader, CircularProgress, LinearProgress, SvgIcon, Theme, useMediaQuery } from "@mui/material";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "../../hooks/onchain/use_wallet";
import useApplication from "../../hooks/use_application";
import { RootState } from "../../redux/store";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import ApplicationForm from "./application_form";
import FlightData from "./flight_data";
import PurchaseSuccess from "./purchase_success";
import { useEnvContext } from "next-runtime-env";
import { setAirportWhitelist } from "../../redux/slices/flightData";
import { useEffect } from "react";

export default function Application() {
    const { t } = useTranslation();
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { connectWallet } = useWallet();
    const { NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST, NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST } = useEnvContext();
    const dispatch = useDispatch();
    const { purchaseProtection } = useApplication();

    const flightDataState = useSelector((state: RootState) => state.flightData);
    const walletIsConnected = useSelector((state: RootState) => state.wallet.address !== null);
    const purchaseSuccessful = useSelector((state: RootState) => state.purchase.policyNftId !== null);
    const executingPurchase = useSelector((state: RootState) => state.purchase.isExecuting);

    // prepare data
    const departureAirport = flightDataState.departureAirport;
    const arrivalAirport = flightDataState.arrivalAirport;
    const isDepartureAirportWhiteListed = flightDataState.departureAirport?.whitelisted || false;
    const isArrivalAirportWhiteListed = flightDataState.arrivalAirport?.whitelisted || false;
    const loadingFlightData = flightDataState.loading;
    const loadingQuote = flightDataState.loadingQuote;
    const flightFound = ! flightDataState.loading && !flightDataState.loadingQuote && flightDataState.arrivalAirport !== null && flightDataState.premium !== null;

    // errors
    const errorMessage = useSelector((state: RootState) => state.flightData.errorMessage);
    const errorLevel = useSelector((state: RootState) => state.flightData.errorLevel);
    const errorReasonApi = useSelector((state: RootState) => state.flightData.errorReasonApi);

    useEffect(() => {
        const departureAirportWhitelist = NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST !== undefined ? NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST.split(',').map((airport) => airport.trim()) : [];
        const arrivalAirportWhitelist = NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST !== undefined ? NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST.split(',').map((airport) => airport.trim()) : [];
        dispatch(setAirportWhitelist({ departure: departureAirportWhitelist, arrival: arrivalAirportWhitelist}));
    }, [NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST, NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST, dispatch]);
    
    let error = <></>;

    if (errorReasonApi !== null) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error"><Trans k="error.no_flight_found" /></Alert>
        </Box>;
    } else if (errorMessage !== null) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity={errorLevel as AlertColor || 'error'}>{errorMessage}</Alert>
        </Box>;
    } else if (flightFound && ! isDepartureAirportWhiteListed) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error"><Trans k="error.departure_airport_not_whitelisted" values={{ airport: departureAirport?.iata }} /></Alert>
        </Box>;
    } else if (flightFound && ! isArrivalAirportWhiteListed) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error"><Trans k="error.arrival_airport_not_whitelisted" values={{ airport: arrivalAirport?.iata }} /></Alert>
        </Box>;
    } 

    let flightDataLoading = <></>;
    if (loadingFlightData || loadingQuote) {
        flightDataLoading = <LinearProgress />;
    }

    let flightData = <></>;
    console.log("flightFound", flightFound);
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
        const buttonText = isSmallScreen ? t('action.purchase_short') : t('action.purchase');
        button = <Button color="primary" fullwidth onClick={purchaseProtection} disabled={purchaseSuccessful}>
            <SvgIcon sx={{ mr: 1 }} fontSize="small">
                <FontAwesomeIcon icon={faCartShopping} />
            </SvgIcon>
            {buttonText}
        </Button>;
    }

    const executePurchase = 
        <Box sx={{ p: 2 }}>
            <CircularProgress sx={{ verticalAlign: 'middle'}} />
            <Box component="span" sx={{ ml: 2 }}><Trans k="purchasing" /></Box>
        </Box>;

    return (<>
        <Card>
            <CardHeader
                avatar={
                    <Image src="/assets/images/etherisc_logo_bird_blue.svg" alt="Etherisc Logo" height={64} width={64} />
                    }
                title={isSmallScreen ? t('app.title.short') : t('app.title')}
                />
            <CardContent>
                <ApplicationForm disableForm={executingPurchase || purchaseSuccessful} />
                {flightDataLoading}
                {flightData}
                {error}
            </CardContent>
            <CardActions sx={{ flexDirection: 'column'}}>
                {(!executingPurchase && !purchaseSuccessful) && button}
                {executingPurchase && executePurchase}
                {(!executingPurchase && purchaseSuccessful) && <PurchaseSuccess />}
            </CardActions>
        </Card>
    </>);
}
