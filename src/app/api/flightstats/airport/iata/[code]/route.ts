import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../../../utils/logger_backend";
import { FLIGHTSTATS_BASE_URL } from "../../../../_utils/api_constants";
import { sendRequestAndReturnResponse } from "../../../../_utils/proxy";

/** 
 * get airport from flightstats. 
 * flightstats docs: https://developer.flightstats.com/api-docs/airports/v1
 */
export async function GET(request: NextRequest, props: { params: Promise<{ code: string }> }) {
    const params = await props.params;
    const reqId = nanoid();
    const code = params.code;
    LOGGER.debug(`[${reqId}] fetching airport data for ${code}`);
    const scheduleUrl = FLIGHTSTATS_BASE_URL + '/airports/rest/v1/json/iata';
    const url = `${scheduleUrl}/${encodeURIComponent(code)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;
    return sendRequestAndReturnResponse(reqId, url);
}
