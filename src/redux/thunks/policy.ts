import { createAsyncThunk } from "@reduxjs/toolkit";
import { useFlightstatsApi } from "../../hooks/api/use_flightstats_api";

export const fetchAirportData = createAsyncThunk(
    'policy/fetchAirportData',
    async (data: { iata?: string}/*, thunkAPI: AsyncThunkConfig*/) => {
        if (data.iata === undefined) {
            return { response: null };
        }
        const { fetchAirport } = useFlightstatsApi();
        const response = await fetchAirport(data.iata);

        // console.log(`flight list length: ${response.flights.length}`);

        // // dispatch quote request
        // if (response.flights.length === 1) {
        //     (thunkAPI.dispatch as AppDispatch)(fetchQuote({ carrier: data.carrier, flightNumber: data.flightNumber }));
        // }

        return { response };
    }
);


