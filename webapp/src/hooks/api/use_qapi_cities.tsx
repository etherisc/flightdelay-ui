import { ResponseBase } from "../../types/qapi/base";
import { QApiCity } from "../../types/qapi/city";
import { CityResponse } from "../../types/qapi/city_response";
import { ClosestCityResponse } from "../../types/qapi/closes_city_response";
import { PayoutScaleResponse } from "../../types/qapi/payout_scale_response";
import { PremiumResponse } from "../../types/qapi/premium_response";
import { BaseError } from "../../utils/error";
import { logErrorOnBackend } from "../../utils/logger";

export function useQApiCities() {
    async function getCity(cityId: number): Promise<QApiCity> {
        try {
            const uri = `/api/cities/${encodeURIComponent(cityId.toString())}`;
            const res = await fetch(uri);
            if (! res.ok) {
                throw new Error(`Error fetching city data: ${res.statusText}`);
            }
            const jsonResponse = await res.json();
            console.log(`GET ${uri} => `, jsonResponse);
            const response = jsonResponse as CityResponse;
            validateQApiResponse(response);
            if (response.city.length > 1) { 
                console.log(`Warning: got ${response.city.length} cities for id ${cityId}, using first one`);
            }
            const city = response.city[0];
            if (city.id !== cityId) {
                throw Error(`Requested city id ${cityId} but got ${city.id}`);
            }
            return city;
        } catch (error) {
            await logErrorOnBackend(`${error.message}`, error.toString(), 'GET /api/cities/:city_id');
            throw error;
        }
    }

    async function getPayoutScale(cityId: number): Promise<PayoutScaleResponse> {
        try {
            const uri = `/api/cities/${encodeURIComponent(cityId.toString())}/payout_scale`;
            const res = await fetch(uri);
            if (!res.ok) {
                throw new Error(`Error fetching payout scale from ${uri}: ${res.statusText}`);
            }
            const jsonResponse = await res.json();
            console.log(`GET ${uri} => `, jsonResponse);
            const response = jsonResponse as PayoutScaleResponse;
            validateQApiResponse(response);
            if (jsonResponse.city_id !== cityId) {
                throw Error(`Requested city id ${cityId} but got ${jsonResponse.city_id}`);
            }
            return jsonResponse as PayoutScaleResponse;
        } catch (error) {
            await logErrorOnBackend(`${error.message}`, error.toString(), 'GET /api/cities/:city_id/payout_scale');
            throw error;
        }
    }

    async function loadPremiumData(cityId: number): Promise<PremiumResponse> {
        try {
            const uri = `/api/cities/${encodeURIComponent(cityId)}/premium`;
            const res = await fetch(uri);
            if (!res.ok) {
                throw new Error(`Error fetching premium data from ${uri}: ${res.statusText}`);
            }
            const jsonResponse = await res.json();
            console.log(`GET ${uri} => `, jsonResponse);
            const response = jsonResponse as PremiumResponse;
            validateQApiResponse(response);
            if (response.city_id !== cityId) {
                throw Error(`Requested city id ${cityId} but got ${response.city_id}`);
            }
            return response;
        } catch (error) {
            await logErrorOnBackend(`${error.message}`, error.toString(), 'GET /api/cities/:city_id/premium');
            throw error;
        }
    }

    async function findClosestCites(lat: number, lng: number, zoom: number) {
        try {
            const uri = `/api/cities/closest?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=${encodeURIComponent(zoom)}`;
            const res = await fetch(uri);
            if (!res.ok) {
                throw new Error(`Error fetching cities from ${uri}: ${res.statusText}`);
            }
            const jsonResponse = await res.json();
            console.log(`GET ${uri} => `, jsonResponse);
            const response = jsonResponse as ClosestCityResponse;
            validateQApiResponse(response);
            return jsonResponse as ClosestCityResponse
        } catch (error) {
            await logErrorOnBackend(`${error.message}`, error.toString(), 'GET /api/cities/closest');
            throw error;
        }
    }

    function validateQApiResponse(response: ResponseBase) {
        if (response.success === 0) {
            const errorId = response.err_id as number;
            const message = response.err_msg as string;
            throw new BaseError(`request failed. type: ${response.request}, err_id: ${errorId} => ${message}`);
        }
    }

    return {
        getCity,
        getPayoutScale,
        loadPremiumData,
        findClosestCites
    }
}
