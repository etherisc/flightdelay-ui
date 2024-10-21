import { createAsyncThunk } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { useFlightstatsApi } from "../../hooks/api/use_flightstats_api";
import { AsyncThunkConfig } from "../../types/redux";
import { AppDispatch } from "../store";

export const fetchFlightData = createAsyncThunk(
    'flightData/fetch',
    async (data: { carrier: string, flightNumber: string, departureDate: dayjs.Dayjs}, thunkAPI: AsyncThunkConfig) => {
        const { fetchFlightData } = useFlightstatsApi();
        const response = await fetchFlightData(data.carrier, data.flightNumber, data.departureDate);

        console.log(`flight list length: ${response.flights.length}`);

        // dispatch quote request
        if (response.flights.length === 1) {
            (thunkAPI.dispatch as AppDispatch)(fetchQuote({ carrier: data.carrier, flightNumber: data.flightNumber }));
        }

        return { response };
    }
);

export const fetchQuote = createAsyncThunk(
    'flightData/fetchQuote',
    async (data: { carrier: string, flightNumber: string}, /*thunkAPI: GetThunkAPI<AsyncThunkConfig>*/) => {
        const { fetchQuote } = useFlightstatsApi();
        const response = await fetchQuote(data.carrier, data.flightNumber);
        return { response };
    }
);


