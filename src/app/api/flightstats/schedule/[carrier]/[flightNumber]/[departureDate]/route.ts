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
    LOGGER.info(`[${reqId}] fetching flight status for ${carrier} ${flightNumber} ${departureDate}`);

    const dateMatch = departureDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
        LOGGER.warn(`[${reqId}] invalid departure date format: ${departureDate}`);
        return Response.json(
            { error: 'invalid_date', message: 'Departure date must be in YYYY-MM-DD format' },
            { status: 400, headers: { 'Content-Type': 'application/json', 'X-Proxy-Request-Id': reqId } }
        );
    }
    const [, year, month, day] = dateMatch;

    return sendRequestAndReturnResponse(reqId, flightstatsScheduleUrl(carrier, flightNumber, year, month, day));
}
