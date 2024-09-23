import { createAsyncThunk } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { useFlightstatsApi } from "../../hooks/api/use_flightstats_api";

export const fetchFlightData = createAsyncThunk(
    'flightData/fetch',
    async (data: { carrier: string, flightNumber: string, departureDate: dayjs.Dayjs}, /*thunkAPI: GetThunkAPI<AsyncThunkConfig>*/) => {
        const { fetchFlightData } = useFlightstatsApi();
        const response = await fetchFlightData(data.carrier, data.flightNumber, data.departureDate);
        return { response };
    }
);


