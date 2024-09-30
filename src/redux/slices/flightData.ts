import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { ARRIVAL_AIRPORTS_WHITELIST, DEPARTURE_AIRPORTS_WHITELIST } from '../../config/constants';
import { Reason } from '../../types/errors';
import { Airport as FsAirport } from '../../types/flightstats/airport';
import { logErrorOnBackend } from '../../utils/logger';
import { fetchFlightData, fetchQuote } from '../thunks/flightData';

export interface FlightDataState {
    carrier: string | null,
    flightNumber: string | null,
    departureDate: string | null,
    departureAirport: Airport | null,
    arrivalAirport: Airport | null,
    departureTime: string | null,
    arrivalTime: string | null,
    loading: boolean,
    loadingQuote: boolean,
    errorReason: Reason | null,
    errorData: unknown | null,
    errorReasonQuote: Reason | null,
    errorDataQuote: unknown | null,
    premium: number | null,
    ontime: number | null,
}

export interface Airport {
    fs: string;
    iata: string;
    icao: string;
    name: string;
    utcOffsetHours: number;
    timeZoneRegionName: string;
    whitelisted: boolean;
}

/**
 * The signup slice contains all the data related to the signup process. This is mostly tentative data that is shown to the user to be selected or confirmed. 
 */
const initialState: FlightDataState = {
    carrier: null,
    flightNumber: null,
    departureDate: null,
    departureAirport: null,
    arrivalAirport: null,
    departureTime: null,
    arrivalTime: null,
    loading: false,
    loadingQuote: false,
    errorReason: null,
    errorData: null,
    errorReasonQuote: null,
    errorDataQuote: null,
    premium: null,
    ontime: null,
};


export const flightDataSlice = createSlice({
    name: 'flightData',
    initialState,
    reducers: {
        setFlight(state, action: PayloadAction<{carrier: string, flightNumber: string; departureDate: string}>) {
            state.carrier = action.payload.carrier;
            state.flightNumber = action.payload.flightNumber;
            state.departureDate = action.payload.departureDate;
        },
        reset(state) {
            // assign initial state
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFlightData.pending, (state, /*action*/) => {
            state.loading = true;
            state.errorReason = null;
            state.errorData = null;
            state.departureAirport = null;
            state.arrivalAirport = null;
            state.departureTime = null;
            state.arrivalTime = null;
        });
        builder.addCase(fetchFlightData.fulfilled, (state, action) => {
            const { response } = action.payload;
            state.loading = false;
            if (response.flights.length === 0) {
                state.errorReason = Reason.NO_FLIGHT_FOUND;
            } else if (response.flights.length > 1) {
                state.errorReason = Reason.INCONSISTENT_DATA;
            } else {
                state.departureAirport = extractAirportData(response.flights[0].departureAirportFsCode, response.airports, DEPARTURE_AIRPORTS_WHITELIST);
                state.arrivalAirport = extractAirportData(response.flights[0].arrivalAirportFsCode, response.airports, ARRIVAL_AIRPORTS_WHITELIST);
                state.departureTime = response.flights[0].departureTime;
                state.arrivalTime = response.flights[0].arrivalTime;
            }
        });
        builder.addCase(fetchFlightData.rejected, (state, action) => {
            state.loading = false;
            state.errorReason = Reason.COMM_ERROR;
            state.errorData = action.error;
            logErrorOnBackend(`${action.error.message}`, JSON.stringify(action.error), 'flightData/fetchFlightData');
        });
        builder.addCase(fetchQuote.pending, (state, /*action*/) => {
            state.loadingQuote = true;
        });
        builder.addCase(fetchQuote.fulfilled, (state, action) => {
            const { response } = action.payload;
            state.loadingQuote = false;
            state.premium = response.premium;
            state.ontime = response.ontimepercent;
        });
    },
});

function extractAirportData(airportFsCode: string, airports: FsAirport[], whitelist: string[]): Airport {
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
    } as Airport;
}

// Action creators are generated for each case reducer function
export const { 
    setFlight,
    reset,
} = flightDataSlice.actions;

export default flightDataSlice.reducer;
