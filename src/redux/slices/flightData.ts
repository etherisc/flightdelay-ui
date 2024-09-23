import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { logErrorOnBackend } from '../../utils/logger';
import { fetchFlightData } from '../thunks/flightData';
import { Reason } from '../../types/errors';

export interface FlightDataState {
    carrier: string | null,
    flightNumber: string | null,
    departureDate: string | null,
    departureAirport: string | null,
    arrivalAirport: string | null,
    departureTime: string | null,
    arrivalTime: string | null,
    loading: boolean,
    errorReason: Reason | null,
    errorData: unknown | null,
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
    errorReason: null,
    errorData: null,
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
            state.arrivalAirport = null;
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
                state.arrivalAirport = response[0].arrivalAirportFsCode
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

    },
});

// Action creators are generated for each case reducer function
export const { 
    setFlight,
    reset,
} = flightDataSlice.actions;

export default flightDataSlice.reducer;
