import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../../../utils/logger_backend";
import { flightstatsAirportUrl } from "../../../../_utils/flightstats";
import { sendRequestAndReturnResponse } from "../../../../_utils/proxy";

/** 
 * get airport from flightstats. 
 * flightstats docs: https://developer.flightstats.com/api-docs/airports/v1
 */
export async function GET(request: NextRequest, props: { params: Promise<{ code: string }> }) {
    const reqId = nanoid();
    const params = await props.params;
    const code = params.code;
    LOGGER.info(`[${reqId}] fetching airport data for ${code}`);
    return sendRequestAndReturnResponse(reqId, flightstatsAirportUrl(code));
}
