import { faCartShopping, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, AlertColor, Box, Card, CardActions, CardContent, CardHeader, CircularProgress, LinearProgress, Modal, SvgIcon, Theme, useMediaQuery } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEnvContext } from "next-runtime-env";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "../../hooks/onchain/use_wallet";
import useApplication from "../../hooks/use_application";
import { setAirportWhitelist } from "../../redux/slices/flightData";
import { RootState } from "../../redux/store";
import { Reason } from "../../types/errors";
import { formatAmount } from "../../utils/amount";
import { logOnBackend } from "../../utils/logger";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import ApplicationForm from "./application_form";
import FlightData from "./flight_data";
import PurchaseSuccess from "./purchase_success";

export default function Application() {
    const { t } = useTranslation();
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { connectWallet } = useWallet();
    const { NEXT_PUBLIC_AIRPORTS_WHITELIST, NEXT_PUBLIC_AIRPORTS_BLACKLIST, NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();
    const dispatch = useDispatch();
    const { purchaseProtection, fetchRiskpoolCapacity } = useApplication();

    const flightDataState = useSelector((state: RootState) => state.flightData);
    const walletIsConnected = useSelector((state: RootState) => state.wallet.isConnected);
    const purchaseSuccessful = useSelector((state: RootState) => state.purchase.policyNftId !== null);
    const executingSigning = useSelector((state: RootState) => state.purchase.isSigning);
    const executingPurchase = useSelector((state: RootState) => state.purchase.isExecuting);

    // prepare data
    const departureAirport = flightDataState.departureAirport;
    const arrivalAirport = flightDataState.arrivalAirport;
    const carrier = flightDataState.carrier;
    const flightNumber = flightDataState.flightNumber;
    const isDepartureAirportWhiteListed = flightDataState.departureAirport?.whitelisted || false;
    const isArrivalAirportWhiteListed = flightDataState.arrivalAirport?.whitelisted || false;
    const isDepartureAirportBlackListed = flightDataState.departureAirport?.blacklisted || false;
    const isArrivalAirportBlackListed = flightDataState.arrivalAirport?.blacklisted || false;
    const loadingFlightData = flightDataState.loading;
    const loadingQuote = flightDataState.loadingQuote;
    const flightFound = ! flightDataState.loading && !flightDataState.loadingQuote && flightDataState.arrivalAirport !== null && flightDataState.premium !== null;

    // errors
    const errorMessage = useSelector((state: RootState) => state.flightData.errorMessage);
    const errorLevel = useSelector((state: RootState) => state.flightData.errorLevel);
    const errorReasonApi = useSelector((state: RootState) => state.flightData.errorReasonApi);

    const flightDataRef = useRef(null);

    useEffect(() => {
        fetchRiskpoolCapacity();
        const airportsWhitelistRaw = NEXT_PUBLIC_AIRPORTS_WHITELIST?.trim() ?? '';
        const airportsWhitelist = airportsWhitelistRaw !== '' ? airportsWhitelistRaw.split(',').map((airport) => airport.trim()) : [];
        const airportsBlacklistRaw = NEXT_PUBLIC_AIRPORTS_BLACKLIST?.trim() ?? '';
        const airportsBlacklist = airportsBlacklistRaw !== '' ? airportsBlacklistRaw.split(',').map((airport) => airport.trim()) : [];
        dispatch(setAirportWhitelist({ airportsWhitelist, airportsBlacklist }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (flightFound) {
            // @ts-expect-error: scrollIntoView is a valid function
            flightDataRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [flightFound]);

    useEffect(() => {
        if ((departureAirport?.iata !== null && departureAirport?.whitelisted === false) && (arrivalAirport?.iata !== null && arrivalAirport?.whitelisted === false)) {
            logOnBackend(`Airport not whitelisted - ${carrier} ${flightNumber} ${departureAirport?.iata} - ${arrivalAirport?.iata}`);
        }
        if ((departureAirport?.iata !== null && departureAirport?.blacklisted === true) || (arrivalAirport?.iata !== null && arrivalAirport?.blacklisted === true)) {
            logOnBackend(`Airport blacklisted - ${carrier} ${flightNumber} ${departureAirport?.iata} - ${arrivalAirport?.iata}`);
        }
    }, [departureAirport, arrivalAirport, carrier, flightNumber]);

    
    let error = <></>;

    if (flightFound && isDepartureAirportBlackListed) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error">
                <Trans k="error.airport_blacklisted" values={{ airport: departureAirport?.iata }} >
                    <a href="/airports" target="_blank" rel="noreferrer noopener"></a>
                </Trans>
            </Alert>
        </Box>;
    } else if (flightFound && isArrivalAirportBlackListed) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error">
                <Trans k="error.airport_blacklisted" values={{ airport: arrivalAirport?.iata }} >
                    <a href="/airports" target="_blank" rel="noreferrer noopener"></a>
                </Trans>
            </Alert>
        </Box>;
    } else if (flightFound && ! isDepartureAirportWhiteListed && ! isArrivalAirportWhiteListed) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error">
                <Trans k="error.airport_not_whitelisted" values={{ dep: departureAirport?.iata, arr: arrivalAirport?.iata }}>
                    <a href="/airports" target="_blank" rel="noreferrer noopener"></a>
                </Trans>
            </Alert>
        </Box>;
    } else if (errorReasonApi !== null) {
        switch(errorReasonApi) {
            case Reason.NOT_ENOUGH_DATA_FOR_QUOTE:
                error = <Box sx={{ py: 2 }}>
                    <Alert severity="error"><Trans k="error.not_enough_data" /></Alert>
                </Box>;
                break;
            case Reason.NOT_ENOUGH_CAPACITY:
                error = <Box sx={{ py: 2 }}>
                    <Alert severity="error"><Trans k="error.riskpool_not_enough_caoacity_for_flight" /></Alert>
                </Box>;
                break;
            default:
                error = <Box sx={{ py: 2 }}>
                    <Alert severity="error"><Trans k="error.no_flight_found" /></Alert>
                </Box>;
        }
        
    } else if (errorMessage !== null) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity={errorLevel as AlertColor || 'error'}>{errorMessage}</Alert>
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
        <SvgIcon sx={{ mr: 1 }} fontSize="small" ref={flightDataRef} >
            <FontAwesomeIcon icon={faWallet} />
        </SvgIcon>
        <Trans k="action.connect" />
    </Button>;
    if (walletIsConnected) {
        const buttonText = isSmallScreen ? t('action.purchase_short') : t('action.purchase');
        button = <Button color="primary" fullwidth onClick={purchaseProtection} disabled={purchaseSuccessful}>
            <SvgIcon sx={{ mr: 1 }} fontSize="small" ref={flightDataRef} >
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
