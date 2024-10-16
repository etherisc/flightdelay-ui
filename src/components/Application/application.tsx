import { faCartShopping, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, AlertColor, Box, Card, CardActions, CardContent, CardHeader, CircularProgress, LinearProgress, Modal, SvgIcon, Theme, useMediaQuery } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEnvContext } from "next-runtime-env";
import Image from "next/image";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "../../hooks/onchain/use_wallet";
import useApplication from "../../hooks/use_application";
import { setAirportWhitelist } from "../../redux/slices/flightData";
import { RootState } from "../../redux/store";
import { formatAmount } from "../../utils/amount";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import ApplicationForm from "./application_form";
import FlightData from "./flight_data";
import PurchaseSuccess from "./purchase_success";

export default function Application() {
    const { t } = useTranslation();
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { connectWallet } = useWallet();
    const { NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST, NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST, NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();
    const dispatch = useDispatch();
    const { purchaseProtection } = useApplication();

    const flightDataState = useSelector((state: RootState) => state.flightData);
    const walletIsConnected = useSelector((state: RootState) => state.wallet.isConnected);
    const purchaseSuccessful = useSelector((state: RootState) => state.purchase.policyNftId !== null);
    const executingSigning = useSelector((state: RootState) => state.purchase.isSigning);
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
        const depatureWhitelistRaw = NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST?.trim() ?? '';
        const arrivalWhitelistRaw = NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST?.trim() ?? '';
        const departureAirportWhitelist = depatureWhitelistRaw !== '' ? depatureWhitelistRaw.split(',').map((airport) => airport.trim()) : [];
        const arrivalAirportWhitelist = arrivalWhitelistRaw !== '' ? arrivalWhitelistRaw.split(',').map((airport) => airport.trim()) : [];
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
            <Modal
                open={true}
                aria-labelledby="loading-modal-title"
                aria-describedby="loading-modal-description"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: grey[200] + `80` }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: "white",
                        opacity: '1.0 !important',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 1,
                        zIndex: 1000
                    }}
                >
                    <CircularProgress />
                    <Box component="span" sx={{ mt: 2 }} maxWidth="md">
                        { ! executingSigning && <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Trans k="purchasing" />
                        </Box>}
                        { executingSigning && <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Alert severity="info">
                                <Trans k="signing_request_1" />
                                <br />
                                <Trans k="signing_request_2" values={{ symbol: NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL, amount: formatAmount(BigInt(flightDataState.premium!), 6, 0)}} >
                                    <b></b>
                                </Trans>
                            </Alert>
                        </Box>}
                    </Box>
                </Box>
            </Modal>

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
