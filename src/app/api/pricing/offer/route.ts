import { nanoid } from "nanoid";
import { sendRequestAndReturnResponse } from "../../_utils/proxy";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../utils/logger_backend";
import { BASE_URL_Q_API, BASE_URL_Q_API_PRICING_OFFER_API, RICHTERX_TOKEN } from "../../_utils/base_urls";

export async function GET(request: NextRequest) {
    const reqId = nanoid();
    // have a dynamic component to avoid prerendering of the api route
    const query = request.nextUrl.search;
    LOGGER.debug(query);
    const baseUrl = BASE_URL_Q_API_PRICING_OFFER_API !== undefined ? BASE_URL_Q_API_PRICING_OFFER_API : BASE_URL_Q_API;
    let url = `${baseUrl}/api/v1/pricing/offer`;
    if (RICHTERX_TOKEN !== undefined) {
        url += `?token=${RICHTERX_TOKEN}`;
    }
    return sendRequestAndReturnResponse(reqId, url);
}
