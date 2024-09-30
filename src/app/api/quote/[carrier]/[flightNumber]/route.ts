import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { LOGGER } from "../../../../../utils/logger_backend";
import { FLIGHTSTATS_BASE_URL } from "../../../_utils/config";
import { sendRequestAndReturnResponse } from "../../../_utils/proxy";
import { FlightLib__factory } from "../../../../../contracts/gif";
import { getBackendVoidSigner } from "../../../_utils/chain";

/**
 * get rating from flightstats and calculate quote via contract call 
 * flightstats docs: https://developer.flightstats.com/api-docs/ratings/v1
 */
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

    LOGGER.debug(`[${reqId}] Ratings:ontime ${rating.ontime}, observations: ${rating.observations}, late15 ${rating.late15}, late30 ${rating.late30}, `
        + `late45 ${rating.late45}, cancelled ${rating.cancelled}, diverted ${rating.diverted} ontimepercent ${rating.ontimepercent}`);

    const signer = await getBackendVoidSigner();
    
    // TODO: calculate premium based on rating by calling onchain quote function (#45)
    // TODO: generate signature for flight rating data
    const productAddress = process.env.NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!;
    const flightLib = FlightLib__factory.connect(process.env.NEXT_PUBLIC_FLIGHT_LIB_ADDRESS!, signer);
    const result = await flightLib.calculatePayoutAmounts(productAddress, 30 * 10 ** 6, [rating.observations, rating.late15, rating.late30, rating.late45, rating.cancelled, rating.diverted]);
    LOGGER.info(`calculatePayoutAmounts ${result[0].toString()}, ${result[1].toString()}, ${result[2].toString()}`);

    return Response.json({
        premium: 30 * 10 ** 6, // FIXME: return actual premium 
        ontimepercent: rating.ontimePercent,
    }, { status: 200 });
}
