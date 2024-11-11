import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../../../../utils/logger_backend";
import { sendRequestAndReturnResponse } from "../../../../../_utils/proxy";
import { flightstatsScheduleUrl } from "../../../../../_utils/flightstats";

/** 
 * get flight schedule from flightstats. 
 * flightstats docs: https://developer.flightstats.com/api-docs/scheduledFlights/v1
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
    LOGGER.debug(`[${reqId}] fetching flight status for ${carrier} ${flightNumber} ${departureDate}`);
    const year = departureDate.split('-')[0];
    const month = departureDate.split('-')[1];
    const day = departureDate.split('-')[2];
    return sendRequestAndReturnResponse(reqId, flightstatsScheduleUrl(carrier, flightNumber, year, month, day));
}
