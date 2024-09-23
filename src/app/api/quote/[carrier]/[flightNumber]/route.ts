import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../../utils/logger_backend";
import { FLIGHTSTATS_BASE_URL } from "../../../_utils/config";
import { sendRequestAndReturnResponse } from "../../../_utils/proxy";

export async function GET(request: NextRequest, { params } : { params: { carrier: string, flightNumber: string } }) {
    const reqId = nanoid();
    const carrier = params.carrier;
    const flightNumber = params.flightNumber;
    LOGGER.debug(`[${reqId}] fetching quote for ${carrier} ${flightNumber}`);
    
    const scheduleUrl = FLIGHTSTATS_BASE_URL + '/ratings/rest/v1/json/flight';
    const url = `${scheduleUrl}/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;

    const response =  await sendRequestAndReturnResponse(reqId, url);
    const jsonResponse = await response.json();

    const rating = jsonResponse.ratings[0];

    LOGGER.debug(`[${reqId}] Ratings: ontime ${rating.ontime}, late15 ${rating.late15}, late30 ${rating.late30}, `
        + `late45 ${rating.late45}, cancelled ${rating.cancelled}, diverted ${rating.diverted} ontimepercent ${rating.ontimepercent}`);

    // TODO: calculate premium based on rating by calling onchain quote function (#45)

    return Response.json({
        premium: 15, // FIXME: return actual premium 
        ontimepercent: rating.ontimePercent,
    }, { status: 200 });
}
