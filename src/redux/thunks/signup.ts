import { createAsyncThunk } from "@reduxjs/toolkit";
import { useQApiCities } from "../../hooks/api/use_qapi_cities";
import { QApiCity } from "../../types/qapi/city";

export const loadPremiumData = createAsyncThunk(
    'signup/loadPremiumData',
    async (cityId: number, /*thunkAPI: GetThunkAPI<AsyncThunkConfig>*/) => {
        const { loadPremiumData } = useQApiCities();
        const response = await loadPremiumData(cityId);
        return { response };
    }
);

export const loadPayoutScale = createAsyncThunk(
    'signup/loadPayoutScale',
    async (data: {locationId: number } /*thunkAPI: GetThunkAPI<AsyncThunkConfig>*/) => {
        const { getPayoutScale } = useQApiCities();
        const { locationId } = data;
        const response = await getPayoutScale(locationId);
        return { response };
    }
);

export const findClosestCites = createAsyncThunk(
    'signup/findClosestCites', 
    async (data: { lat: number, lng: number, zoom: number }, /*thunkAPI: GetThunkAPI<AsyncThunkConfig>*/) => {
        const { findClosestCites } = useQApiCities();
        const { lat, lng, zoom } = data;
        const response = await findClosestCites(lat, lng, zoom);
        return response.cities as QApiCity[];
    }
);
