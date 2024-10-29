import { Alert, AlertColor, Box } from "@mui/material";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Reason } from "../../types/errors";
import { logOnBackend } from "../../utils/logger";
import Trans from "../Trans/trans";
import { FlightDataState } from "../../redux/slices/flightData";
import { EVENT_API_ERROR, EVENT_BLACKLISTED_DEPARTURE_AIRPORT, EVENT_NO_FLIGHT_FOUND, EVENT_NON_WHITELISTED_AIRPORT, EVENT_QUOTE_NOT_ENOUGH_DATA, EVENT_QUOTE_POOL_CAPACITY_EXCEEDED, useAnalytics } from "../../hooks/use_analytics";

export function ApplicationError({flightFound, flightData}: {flightFound: boolean, flightData: FlightDataState}) {
    // errors
    const { trackEvent } = useAnalytics();
    const errorMessage = useSelector((state: RootState) => state.flightData.errorMessage);
    const errorLevel = useSelector((state: RootState) => state.flightData.errorLevel);
    const errorReasonApi = useSelector((state: RootState) => state.flightData.errorReasonApi);
    const isDepartureAirportWhiteListed = flightData.departureAirport?.whitelisted || false;
    const isArrivalAirportWhiteListed = flightData.arrivalAirport?.whitelisted || false;
    const isDepartureAirportBlackListed = flightData.departureAirport?.blacklisted || false;
    const isArrivalAirportBlackListed = flightData.arrivalAirport?.blacklisted || false;
    const departureAirport = flightData.departureAirport;
    const arrivalAirport = flightData.arrivalAirport;
    
    useEffect(() => {
        if ((departureAirport?.iata !== null && departureAirport?.whitelisted === false) && (arrivalAirport?.iata !== null && arrivalAirport?.whitelisted === false)) {
            logOnBackend(`Airport not whitelisted - ${flightData.carrier} ${flightData.flightNumber} ${departureAirport?.iata} - ${arrivalAirport?.iata}`);
        }
        if ((departureAirport?.iata !== null && departureAirport?.blacklisted === true) || (arrivalAirport?.iata !== null && arrivalAirport?.blacklisted === true)) {
            logOnBackend(`Airport blacklisted - ${flightData.carrier} ${flightData.flightNumber} ${departureAirport?.iata} - ${arrivalAirport?.iata}`);
        }
    }, [departureAirport, arrivalAirport, flightData]);

    if (flightFound && isDepartureAirportBlackListed) {
        trackEvent(EVENT_BLACKLISTED_DEPARTURE_AIRPORT, { category: 'flight_search', airport: departureAirport?.iata });
        return <Box sx={{ py: 2 }}>
            <Alert severity="error">
                <Trans k="error.airport_blacklisted" values={{ airport: departureAirport?.iata }} >
                    <a href="/airports" target="_blank" rel="noreferrer noopener"></a>
                </Trans>
            </Alert>
        </Box>;
    } else if (flightFound && isArrivalAirportBlackListed) {
        trackEvent(EVENT_BLACKLISTED_DEPARTURE_AIRPORT, { category: 'flight_search', airport: arrivalAirport?.iata });
        return <Box sx={{ py: 2 }}>
            <Alert severity="error">
                <Trans k="error.airport_blacklisted" values={{ airport: arrivalAirport?.iata }} >
                    <a href="/airports" target="_blank" rel="noreferrer noopener"></a>
                </Trans>
            </Alert>
        </Box>;
    } else if (flightFound && ! isDepartureAirportWhiteListed && ! isArrivalAirportWhiteListed) {
        trackEvent(EVENT_NON_WHITELISTED_AIRPORT, { category: "flight_search", departure: departureAirport?.iata, arrival: arrivalAirport?.iata});
        return <Box sx={{ py: 2 }}>
            <Alert severity="error">
                <Trans k="error.airport_not_whitelisted" values={{ dep: departureAirport?.iata, arr: arrivalAirport?.iata }}>
                    <a href="/airports" target="_blank" rel="noreferrer noopener"></a>
                </Trans>
            </Alert>
        </Box>;
    } else if (errorReasonApi !== null) {
        switch(errorReasonApi) {
            case Reason.NOT_ENOUGH_DATA_FOR_QUOTE:
                trackEvent(EVENT_QUOTE_NOT_ENOUGH_DATA, { category: 'flight_search', carrier: flightData.carrier, flightNumber: flightData.flightNumber });
                return <Box sx={{ py: 2 }}>
                    <Alert severity="error"><Trans k="error.not_enough_data" /></Alert>
                </Box>;

            case Reason.NOT_ENOUGH_CAPACITY:
                trackEvent(EVENT_QUOTE_POOL_CAPACITY_EXCEEDED, { category: 'flight_search' });
                return <Box sx={{ py: 2 }}>
                    <Alert severity="error"><Trans k="error.riskpool_not_enough_caoacity_for_flight" /></Alert>
                </Box>;

            case Reason.NO_FLIGHT_FOUND:
                    trackEvent(EVENT_NO_FLIGHT_FOUND, { category: 'flight_search' });
                    return <Box sx={{ py: 2 }}>
                        <Alert severity="error"><Trans k="error.no_flight_found" /></Alert>
                    </Box>;
            
            default:
                trackEvent(EVENT_API_ERROR, { category: 'flight_search', error: errorReasonApi });
                return <Box sx={{ py: 2 }}>
                    <Alert severity="error"><Trans k="error.no_flight_found" /></Alert>
                </Box>;
        }
        
    } else if (errorMessage !== null) {
        return <Box sx={{ py: 2 }}>
            <Alert severity={errorLevel as AlertColor || 'error'}>{errorMessage}</Alert>
        </Box>;
    } 
    
    return undefined; // no error
}