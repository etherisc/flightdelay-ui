import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../../../../utils/logger_backend";
import { flightstatsStatusUrl } from "../../../../../_utils/flightstats";
import { sendRequestAndReturnResponse } from "../../../../../_utils/proxy";

/** 
 * get flight status from flightstats 
 * flightstats docs: https://developer.flightstats.com/api-docs/flightstatus/v2/flight
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ carrier: string, flightNumber: string, departureDate: string }> }
) {
    const params = await props.params;
    const reqId = nanoid();
    const carrier = params.carrier;
    const flightNumber = params.flightNumber;
    const departureDate = params.departureDate;
    LOGGER.debug(`[${reqId}] fetching flight data for ${carrier} ${flightNumber} ${departureDate}`);
    const year = departureDate.split('-')[0];
    const month = departureDate.split('-')[1];
    const day = departureDate.split('-')[2];
    return sendRequestAndReturnResponse(reqId, flightstatsStatusUrl(carrier, flightNumber, year, month, day));
}
