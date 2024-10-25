import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { Reason } from '../../types/errors';
import { Airport as FsAirport } from '../../types/flightstats/airport';
import { logErrorOnBackend } from '../../utils/logger';
import { adjustToUtc } from '../../utils/time';
import { fetchFlightData, fetchQuote } from '../thunks/flightData';

export interface FlightDataState {
    riskpoolHasCapacity: boolean;
    carrier: string | null;
    flightNumber: string | null;
    departureDate: string | null;
    departureAirport: Airport | null;
    arrivalAirport: Airport | null;
    airportsWhitelist: string[];
    airportsBlacklist: string[];
    departureTime: string | null;
    departureTimeUTC: string | null;
    arrivalTime: string | null;
    arrivalTimeUTC: string | null;
    loading: boolean;
    loadingQuote: boolean;
    errorMessage: string | null;
    errorLevel: string | null;
    errorReasonApi: Reason | null;
    errorDataApi: unknown | null;
    premium: number | null;
    ontime: number | null;
    /** this is a list of 6 values: [observations, late15, late30, late45, cancelled, diverted] */
    statistics: bigint[] | null;
    payoutAmounts: PayoutAmounts | null;
}

export interface Airport {
    fs: string;
    iata: string;
    icao: string;
    name: string;
    utcOffsetHours: number;
    timeZoneRegionName: string;
    whitelisted: boolean;
    blacklisted: boolean;
}

export interface PayoutAmounts {
    delayed: bigint;
    cancelled: bigint;
    diverted: bigint;
}

/**
 * The signup slice contains all the data related to the signup process. This is mostly tentative data that is shown to the user to be selected or confirmed. 
 */
const initialState: FlightDataState = {
    riskpoolHasCapacity: true,
    carrier: null,
    flightNumber: null,
    departureDate: null,
    departureAirport: null,
    arrivalAirport: null,
    airportsWhitelist: [],
    airportsBlacklist: [],
    departureTime: null,
    departureTimeUTC: null,
    arrivalTime: null,
    arrivalTimeUTC: null,
    loading: false,
    loadingQuote: false,
    errorMessage: null,
    errorLevel: null,
    errorReasonApi: null,
    errorDataApi: null,
    premium: null,
    ontime: null,
    statistics: null,
    payoutAmounts: null,
};


export const flightDataSlice = createSlice({
    name: 'flightData',
    initialState,
    reducers: {
        setRiskpoolHasCapacity(state, action: PayloadAction<boolean>) {
            state.riskpoolHasCapacity = action.payload;
        },
        setAirportWhitelist(state, action: PayloadAction<{ airportsWhitelist: string[], airportsBlacklist: string[]}>) {
            state.airportsWhitelist = action.payload.airportsWhitelist;
            state.airportsBlacklist = action.payload.airportsBlacklist;
        },
        setFlight(state, action: PayloadAction<{carrier: string, flightNumber: string; departureDate: string}>) {
            state.carrier = action.payload.carrier;
            state.flightNumber = action.payload.flightNumber;
            state.departureDate = action.payload.departureDate;
        },
        setError(state, action: PayloadAction<{message: string, level: string}>) {
            state.errorMessage = action.payload.message;
            state.errorLevel = action.payload.level;
        },
        resetFlightData(state) {
            // assign initial state
            Object.assign(state, initialState);
        },
        resetErrors(state) {
            state.errorReasonApi = null;
            state.errorDataApi = null;
            state.errorMessage = null;
            state.errorLevel = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFlightData.pending, (state, /*action*/) => {
            state.loading = true;
            state.errorReasonApi = null;
            state.errorDataApi = null;
            state.errorMessage = null;
            state.errorLevel = null;
            state.departureAirport = null;
            state.arrivalAirport = null;
            state.departureTime = null;
            state.arrivalTime = null;
        });
        builder.addCase(fetchFlightData.fulfilled, (state, action) => {
            const { response } = action.payload;
            state.loading = false;
            if (response.carrier !== state.carrier || response.flightNumber !== state.flightNumber) {
                // this is a response for a different flight, ignore it
                return;
            }
            if (response.flights.length === 0) {
                state.errorReasonApi = Reason.NO_FLIGHT_FOUND;
            } else if (response.flights.length > 1) {
                state.errorReasonApi = Reason.INCONSISTENT_DATA;
            } else {
                state.departureAirport = extractAirportData(response.flights[0].departureAirportFsCode, response.airports, state.airportsWhitelist, state.airportsBlacklist);
                state.arrivalAirport = extractAirportData(response.flights[0].arrivalAirportFsCode, response.airports, state.airportsWhitelist, state.airportsBlacklist);
                state.departureTime = response.flights[0].departureTime;
                state.departureTimeUTC = adjustToUtc(response.flights[0].departureTime, state.departureAirport.timeZoneRegionName).toISOString();
                state.arrivalTime = response.flights[0].arrivalTime;
                state.arrivalTimeUTC = adjustToUtc(response.flights[0].arrivalTime, state.arrivalAirport.timeZoneRegionName).toISOString();
            }
        });
        builder.addCase(fetchFlightData.rejected, (state, action) => {
            state.loading = false;
            state.errorReasonApi = Reason.COMM_ERROR;
            state.errorDataApi = action.error;
            logErrorOnBackend(`${action.error.message}`, JSON.stringify(action.error), 'flightData/fetchFlightData');
        });
        builder.addCase(fetchQuote.pending, (state, /*action*/) => {
            state.loadingQuote = true;
        });
        builder.addCase(fetchQuote.fulfilled, (state, action) => {
            state.loadingQuote = false;
            const { response } = action.payload;
            if (state.carrier !== response.carrier || state.flightNumber !== response.flightNumber) {
                // this is a quote for a different flight, ignore it
                return;
            }
            if (response.error !== undefined) {
                state.errorReasonApi = response.error;
                state.errorLevel = 'warning';
                state.premium = 0;
                state.ontime = 0;
                return;
            }
            state.premium = response.premium;
            state.ontime = response.ontimepercent;
            state.payoutAmounts = response.payouts;
            state.statistics = response.statistics;
        });
        builder.addCase(fetchQuote.rejected, (state, action) => {
            state.loadingQuote = false;
            state.errorReasonApi = Reason.COMM_ERROR;
            state.errorDataApi = action.error;
            logErrorOnBackend(`${action.error.message}`, JSON.stringify(action.error), 'flightData/fetchQuote');
        });
    },
});

function extractAirportData(airportFsCode: string, airports: FsAirport[], whitelist: string[], blacklist: string[]): Airport {
    const ap = airports.find((a) => a.fs === airportFsCode);
    if (ap === undefined) {
        return {
            fs: '',
            iata: '',
            icao: '',
            name: '',
            utcOffsetHours: 0,
            timeZoneRegionName: '',
            whitelisted: false,
            blacklisted: false,
        } as Airport;
    }
    return {
        fs: ap?.fs || '',
        iata: ap?.iata || '',
        icao: ap?.icao || '',
        name: ap?.name || '',
        utcOffsetHours: ap?.utcOffsetHours || 0,
        timeZoneRegionName: ap?.timeZoneRegionName || '',
        whitelisted: whitelist.length > 0 ? whitelist.includes(ap?.iata) : true,
        blacklisted: blacklist.length > 0 ? blacklist.includes(ap?.iata) : false,
    } as Airport;
}

// Action creators are generated for each case reducer function
export const { 
    setRiskpoolHasCapacity,
    setAirportWhitelist,
    setFlight,
    setError,
    resetErrors,
    resetFlightData,
} = flightDataSlice.actions;

export default flightDataSlice.reducer;
