import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../../../../utils/logger_backend";
import { FLIGHTSTATS_BASE_URL } from "../../../../../_utils/config";
import { sendRequestAndReturnResponse } from "../../../../../_utils/proxy";

/** 
 * get flight status from flightstats 
 * flightstats docs: https://developer.flightstats.com/api-docs/flightstatus/v2/flight
 */
export async function GET(request: NextRequest, { params } : { params: { carrier: string, flightNumber: string, departureDate: string } }) {
    const reqId = nanoid();
    const carrier = params.carrier;
    const flightNumber = params.flightNumber;
    const departureDate = params.departureDate;
    LOGGER.debug(`[${reqId}] fetching flight data for ${carrier} ${flightNumber} ${departureDate}`);
    const year = departureDate.split('-')[0];
    const month = departureDate.split('-')[1];
    const day = departureDate.split('-')[2];
    const statusUrl = FLIGHTSTATS_BASE_URL + '/flightstatus/rest/v2/json/flight/status/';
    const url = `${statusUrl}/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}` 
        + `/dep/${encodeURIComponent(year)}/${encodeURIComponent(month)}/${encodeURIComponent(day)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;
    return sendRequestAndReturnResponse(reqId, url);
}
