import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { logErrorOnBackend } from '../../utils/logger';
import { fetchFlightData, fetchQuote } from '../thunks/flightData';
import { Reason } from '../../types/errors';
import { ARRIVAL_AIRPORTS_WHITELIST, DEPARTURE_AIRPORTS_WHITELIST } from '../../config/constants';

export interface FlightDataState {
    carrier: string | null,
    flightNumber: string | null,
    departureDate: string | null,
    departureAirport: string | null,
    departureAirportWhitelisted: boolean,
    arrivalAirport: string | null,
    arrivalAirportWhitelisted: boolean
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

/**
 * The signup slice contains all the data related to the signup process. This is mostly tentative data that is shown to the user to be selected or confirmed. 
 */
const initialState: FlightDataState = {
    carrier: null,
    flightNumber: null,
    departureDate: null,
    departureAirport: null,
    departureAirportWhitelisted: true,
    arrivalAirport: null,
    arrivalAirportWhitelisted: true,
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
        setFlight(state, action: PayloadAction<{carrier: string, flightNumber: string; departureDate: dayjs.Dayjs}>) {
            state.carrier = action.payload.carrier;
            state.flightNumber = action.payload.flightNumber;
            state.departureDate = action.payload.departureDate.toISOString();
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
            state.departureAirportWhitelisted = true;
            state.arrivalAirport = null;
            state.arrivalAirportWhitelisted = true;
            state.departureTime = null;
            state.arrivalTime = null;
        });
        builder.addCase(fetchFlightData.fulfilled, (state, action) => {
            const { response } = action.payload;
            state.loading = false;
            if (response.length === 0) {
                state.errorReason = Reason.NO_FLIGHT_FOUND;
            } else if (response.length > 1) {
                state.errorReason = Reason.INCONSISTENT_DATA;
            } else {
                state.departureAirport = response[0].departureAirportFsCode
                state.departureAirportWhitelisted = DEPARTURE_AIRPORTS_WHITELIST.length > 0 ? DEPARTURE_AIRPORTS_WHITELIST.includes(response[0].departureAirportFsCode) : true;
                state.arrivalAirport = response[0].arrivalAirportFsCode
                state.arrivalAirportWhitelisted = ARRIVAL_AIRPORTS_WHITELIST.length > 0 ? ARRIVAL_AIRPORTS_WHITELIST.includes(response[0].arrivalAirportFsCode) : true;
                state.departureTime = response[0].departureTime;
                state.arrivalTime = response[0].arrivalTime;
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

// Action creators are generated for each case reducer function
export const { 
    setFlight,
    reset,
} = flightDataSlice.actions;

export default flightDataSlice.reducer;
