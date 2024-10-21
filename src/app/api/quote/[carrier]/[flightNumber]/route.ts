import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { FlightProduct__factory } from "../../../../../contracts/flight";
import { PayoutAmounts } from "../../../../../redux/slices/flightData";
import { Rating } from "../../../../../types/flightstats/rating";
import { LOGGER } from "../../../../../utils/logger_backend";
import { FLIGHTSTATS_BASE_URL, PREMIUM } from "../../../_utils/api_constants";
import { getBackendVoidSigner } from "../../../_utils/chain";
import { sendRequestAndReturnResponse } from "../../../_utils/proxy";

// @ts-expect-error BigInt is not defined in the global scope
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

/**
 * get rating from flightstats and calculate payout amounts via smart contract call 
 * flightstats docs: https://developer.flightstats.com/api-docs/ratings/v1
 */
export async function GET(request: NextRequest, { params } : { params: { carrier: string, flightNumber: string } }) {
    const reqId = nanoid();
    const carrier = params.carrier;
    const flightNumber = params.flightNumber;
    const premium = BigInt(PREMIUM);

    // fetch rating data from flightstats
    const rating = await fetchFlightstatsRating(reqId, carrier, flightNumber);

    if (rating === null) {
        return Response.json({ error: 'No rating data found' }, { status: 404 });
    }
    
    let payouts = {
        delayed: BigInt(0),
        cancelled: BigInt(0),
        diverted: BigInt(0)
    } as PayoutAmounts;

    try {
        // calculate payout amounts via smart contract call
        payouts = await calculatePayoutAmounts(reqId, premium, rating);
    } catch (err) {
        LOGGER.error(`[${reqId}] Error calculating payout amounts: ${err}`);
        return Response.json({ error: 'calculation of payout amounts failed' }, { status: 404 });
    }

    return Response.json({
        premium, 
        payouts,
        ontimepercent: rating.ontimePercent,
        statistics: [rating.observations, rating.late15, rating.late30, rating.late45, rating.cancelled, rating.diverted],
    }, { status: 200 });
}

async function calculatePayoutAmounts(reqId: string, premium: bigint, rating: Rating): Promise<PayoutAmounts> {
    LOGGER.debug(`[${reqId}] calling calculatePayoutAmounts ${premium}`);
    const signer = await getBackendVoidSigner();
    const productAddress = process.env.NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!;
    const flightProduct = FlightProduct__factory.connect(productAddress, signer);
    
    const result = await flightProduct.calculatePayoutAmounts(productAddress, premium, [rating.observations, rating.late15, rating.late30, rating.late45, rating.cancelled, rating.diverted]);
    const payouts = {
        delayed: BigInt(result[1][2]),
        cancelled: BigInt(result[1][3]),
        diverted: BigInt(result[1][4]),
    };
    LOGGER.info(`calculatePayoutAmounts => ${result[0].toString()}, ${result[1].toString()}, ${result[2].toString()}`);
    
    return payouts;
}

async function fetchFlightstatsRating(reqId: string, carrier: string, flightNumber: string): Promise<Rating|null> {
    LOGGER.debug(`[${reqId}] fetching quote for ${carrier} ${flightNumber}`);

    const scheduleUrl = FLIGHTSTATS_BASE_URL + '/ratings/rest/v1/json/flight';
    const url = `${scheduleUrl}/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;

    const response = await sendRequestAndReturnResponse(reqId, url);
    const jsonResponse = await response.json();

    if (jsonResponse.ratings === undefined || jsonResponse.ratings.length === 0) {
        LOGGER.warn(`[${reqId}] No rating data found for ${carrier} ${flightNumber}`);
        return null;
    }

    const rating = jsonResponse.ratings[0] as Rating;

    LOGGER.info(`[${reqId}] Ratings:ontime ${rating.ontime}, observations: ${rating.observations}, late15 ${rating.late15}, late30 ${rating.late30}, `
        + `late45 ${rating.late45}, cancelled ${rating.cancelled}, diverted ${rating.diverted} ontimepercent ${rating.ontimePercent}`);
    return rating;
}

