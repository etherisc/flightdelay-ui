import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { sendRequestAndReturnResponse } from "../../../_utils/proxy";
import { BASE_URL_Q_API, BASE_URL_Q_API_CITIES_PREMIUM_API, RICHTERX_TOKEN } from "../../../_utils/base_urls";

export async function GET(request: NextRequest, { params } : { params: { cityId: number } }) {
    const reqId = nanoid();
    const cityId = params.cityId;
    const baseUrl = BASE_URL_Q_API_CITIES_PREMIUM_API !== undefined ? BASE_URL_Q_API_CITIES_PREMIUM_API : BASE_URL_Q_API;
    let url = `${baseUrl}/api/v1/cities/premium?city_id=${encodeURIComponent(cityId)}`;
    if (RICHTERX_TOKEN !== undefined) {
        url += `&token=${RICHTERX_TOKEN}`;
    }
    return sendRequestAndReturnResponse(reqId, url);
}
