import { faCartShopping, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Card, CardActions, CardContent, CardHeader, LinearProgress, SvgIcon, Theme, Typography, useMediaQuery } from "@mui/material";
import { useDebounce } from "@react-hooks-hub/use-debounce";
import dayjs from "dayjs";
import { useEnvContext } from "next-runtime-env";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "../../hooks/onchain/use_wallet";
import useApplication from "../../hooks/use_application";
import { resetErrors, resetFlightData, setAirportWhitelist, setFlight } from "../../redux/slices/flightData";
import { resetPurchase } from "../../redux/slices/purchase";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchFlightData } from "../../redux/thunks/flightData";
import { formatAmount } from "../../utils/amount";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import { ApplicationError } from "./application_error";
import ApplicationForm, { IApplicationFormValues } from "./application_form";
import FlightData from "./flight_data";
import PurchaseExecutionModal from "./purchase_execution_modal";
import PurchaseSuccess from "./purchase_success";
import { EVENT_FETCH_FLIGHT_DATA, useAnalytics } from "../../hooks/use_analytics";

export default function Application() {
    const { t } = useTranslation();
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { connectWallet } = useWallet();
    const { NEXT_PUBLIC_AIRPORTS_WHITELIST, NEXT_PUBLIC_AIRPORTS_BLACKLIST, NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM, NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS, NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();
    const dispatch = useDispatch() as AppDispatch;
    const { purchaseProtection, fetchRiskpoolCapacity } = useApplication();
    const { trackEvent } = useAnalytics();

    const flightDataState = useSelector((state: RootState) => state.flightData);
    const walletIsConnected = useSelector((state: RootState) => state.wallet.isConnected);
    const purchaseSuccessful = useSelector((state: RootState) => state.purchase.policyNftId !== null);
    const executingSigning = useSelector((state: RootState) => state.purchase.isSigning);
    const executingPurchase = useSelector((state: RootState) => state.purchase.isExecuting);

    const departureDateMin = (NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM !== undefined) ? dayjs(NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM) : dayjs().add(parseInt(NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS || '14'), 'd');

    // prepare data
    const loadingFlightData = flightDataState.loading;
    const loadingQuote = flightDataState.loadingQuote;
    const flightFound = ! flightDataState.loading && !flightDataState.loadingQuote && flightDataState.arrivalAirport !== null && flightDataState.premium !== null;

    const sendFlightDataRequest = async (carrier: string, flightNumber: string, departureDate: dayjs.Dayjs) => {
        // only send again if data is changed
        if ((carrier !== flightDataState.carrier || flightNumber !== flightDataState.flightNumber || departureDate.toISOString() !== flightDataState.departureDate)
            && carrier !== "" && flightNumber !== "" && departureDate !== null) {
            dispatch(resetErrors());
            dispatch(setFlight({ carrier, flightNumber, departureDate: departureDate.toISOString() }));
            dispatch(fetchFlightData({carrier, flightNumber, departureDate}));
            trackEvent(EVENT_FETCH_FLIGHT_DATA, { category: 'flight_search', carrier, flightNumber, departureDate: departureDate.format('YYYY-MM-DD') });
        }
    };

    const debouncedFetchFlightData = useDebounce(sendFlightDataRequest, 600);

    const { control, formState, watch, reset } = useForm<IApplicationFormValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        shouldFocusError: false,
        defaultValues: {
            carrier: "",
            flightNumber: "",
            departureDate: departureDateMin,
        }
    });

    const formValues = watch();
    useEffect(() => {
        if (formState.isValid) {
            debouncedFetchFlightData(formValues.carrier, formValues.flightNumber, formValues.departureDate);
        }
    }, [formValues, debouncedFetchFlightData, formState.isValid]);

    useEffect(() => {
        fetchRiskpoolCapacity();
        const airportsWhitelistRaw = NEXT_PUBLIC_AIRPORTS_WHITELIST?.trim() ?? '';
        const airportsWhitelist = airportsWhitelistRaw !== '' ? airportsWhitelistRaw.split(',').map((airport) => airport.trim()) : [];
        const airportsBlacklistRaw = NEXT_PUBLIC_AIRPORTS_BLACKLIST?.trim() ?? '';
        const airportsBlacklist = airportsBlacklistRaw !== '' ? airportsBlacklistRaw.split(',').map((airport) => airport.trim()) : [];
        dispatch(setAirportWhitelist({ airportsWhitelist, airportsBlacklist }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function resetForm() {
        dispatch(resetPurchase());
        dispatch(resetFlightData());
        reset();
    }

    let button = <Button color="primary" fullwidth onClick={connectWallet}>
        <SvgIcon sx={{ mr: 1 }} fontSize="small" >
            <FontAwesomeIcon icon={faWallet} />
        </SvgIcon>
        <Trans k="action.connect" />
    </Button>;

    if (walletIsConnected) {
        button = <Button color="primary" fullwidth onClick={purchaseProtection} disabled={purchaseSuccessful}>
            <SvgIcon sx={{ mr: 1 }} fontSize="small" >
                <FontAwesomeIcon icon={faCartShopping} />
            </SvgIcon>
            {t('action.purchase')} {NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(BigInt(flightDataState.premium ?? 0), 6, 0)}
        </Button>;
    }

    return (<>
        <PurchaseExecutionModal executingPurchase={executingPurchase} executingSigning={executingSigning} premium={flightDataState.premium} />
        <PurchaseSuccess purchaseSuccessful={purchaseSuccessful} resetForm={resetForm} />
        <Card>
            <CardHeader
                avatar={
                    <Image src="/assets/images/etherisc_logo_bird_blue.svg" alt="Etherisc Logo" height={64} width={64} />
                    }
                title={isSmallScreen ? t('app.title.short') : t('app.title')}
                />
            <CardContent>
                <Instructions />
                <ApplicationForm 
                    disableForm={executingPurchase || purchaseSuccessful}
                    formState={formState}
                    control={control} />
                {(loadingFlightData || loadingQuote) && <LinearProgress />}
                {flightFound && <FlightData 
                                    departureAirport={flightDataState.departureAirport!}
                                    arrivalAirport={flightDataState.arrivalAirport!}
                                    departureTime={flightDataState.departureTime!}
                                    arrivalTime={flightDataState.arrivalTime!}
                                    ontimepercent={flightDataState.ontime!}
                                    premium={flightDataState.premium!}
                                    payoutAmounts={flightDataState.payoutAmounts!}
                                    carrier={flightDataState.carrier!}
                                    flightNumber={flightDataState.flightNumber!}
                                    />}
                <ApplicationError flightFound={flightFound} flightData={flightDataState} />
            </CardContent>
            <CardActions sx={{ flexDirection: 'column', p: 2}}>
                <Actions 
                    button={button} 
                    executingPurchase={executingPurchase} 
                    purchaseSuccessful={purchaseSuccessful} />
            </CardActions>
        </Card>
        {/* <DevTool control={control} /> set up the dev tool */}
    </>);
}

function Instructions() {
    return <Box sx={{ mb: 4 }}>
            <Typography variant="body2" component="p">
                <Trans k="application_instructions" />
            </Typography>
        </Box>;
}

function Actions({ button, executingPurchase, purchaseSuccessful }: { button: JSX.Element, executingPurchase: boolean, purchaseSuccessful: boolean }) {
    return <>
            {(!executingPurchase && !purchaseSuccessful) && button}
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
