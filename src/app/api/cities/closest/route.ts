import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { sendRequestAndReturnResponse } from "../../_utils/proxy";
import { BASE_URL_Q_API, BASE_URL_Q_API_CITIES_CLOSEST_API, RICHTERX_TOKEN } from "../../_utils/base_urls";

export async function GET(request: NextRequest) {
    const reqId = nanoid();
    const query = request.nextUrl.search;
    const baseUrl = BASE_URL_Q_API_CITIES_CLOSEST_API !== undefined ? BASE_URL_Q_API_CITIES_CLOSEST_API : BASE_URL_Q_API;
    let url = `${baseUrl}/api/v1/cities/closest${query}`;
    if (RICHTERX_TOKEN !== undefined) {
        url += `&token=${RICHTERX_TOKEN}`;
    }
    return sendRequestAndReturnResponse(reqId, url);
}
