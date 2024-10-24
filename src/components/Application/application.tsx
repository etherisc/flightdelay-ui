import { faCartShopping, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, Card, CardActions, CardContent, CardHeader, CircularProgress, LinearProgress, Modal, SvgIcon, Theme, Typography, useMediaQuery } from "@mui/material";
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
import { formatAmount } from "../../utils/amount";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import { ApplicationError } from "./application_error";
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
    const loadingFlightData = flightDataState.loading;
    const loadingQuote = flightDataState.loadingQuote;
    const flightFound = ! flightDataState.loading && !flightDataState.loadingQuote && flightDataState.arrivalAirport !== null && flightDataState.premium !== null;

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
                <Instructions />
                <ApplicationForm disableForm={executingPurchase || purchaseSuccessful} />
                {flightDataLoading}
                {flightData}
                <ApplicationError flightFound={flightFound} flightData={flightDataState} />
            </CardContent>
            <CardActions sx={{ flexDirection: 'column'}}>
                <Actions 
                    button={button} 
                    executingPurchase={executingPurchase} 
                    purchaseSuccessful={purchaseSuccessful} 
                    executePurchase={executePurchase} />
            </CardActions>
        </Card>
    </>);
}

function Instructions() {
    return <Box sx={{ mb: 4 }}>
            <Typography variant="body2" component="p">
                <Trans k="application_instructions" />
            </Typography>
        </Box>;
}

function Actions({ button, executingPurchase, purchaseSuccessful, executePurchase }: { button: JSX.Element, executingPurchase: boolean, purchaseSuccessful: boolean, executePurchase: JSX.Element }) {
    return <>
            {(!executingPurchase && !purchaseSuccessful) && button}
            {executingPurchase && executePurchase}
            {(!executingPurchase && purchaseSuccessful) && <PurchaseSuccess />}
            <Box sx={{ py: 2 }}>
                <Typography variant="body2" component="p" color="textSecondary">
                    <Trans k="purchase_disclaimer">
                        <a href="https://www.circle.com/multi-chain-usdc/base" target="_blank" rel="noreferrer noopener" className="link"></a>
                        <a href="https://www.base.org/" target="_blank" rel="noreferrer noopener" className="link"></a>
                    </Trans>
                </Typography>
            </Box>
        </>;
}