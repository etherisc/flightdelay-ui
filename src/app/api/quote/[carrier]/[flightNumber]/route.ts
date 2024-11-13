import { formatUnits, Signer } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { FlightLib__factory, FlightOracle__factory, FlightPool__factory, FlightProduct__factory, FlightUSD__factory } from "../../../../../contracts/flight";
import { IBundleService__factory, IPolicyService__factory, IPoolService__factory } from "../../../../../contracts/gif";
import { PayoutAmounts } from "../../../../../redux/slices/flightData";
import { Rating } from "../../../../../types/flightstats/rating";
import { CapacityError } from "../../../../../utils/error";
import { LOGGER } from "../../../../../utils/logger_backend";
import { getAvailableCapacity } from "../../../../../utils/riskpool";
import { POOL_CONTRACT_ADDRESS, PREMIUM } from "../../../_utils/api_constants";
import { getBackendVoidSigner } from "../../../_utils/chain";
import { flightstatsRatingsUrl } from "../../../_utils/flightstats";
import { sendRequestAndReturnResponse } from "../../../_utils/proxy";

// @ts-expect-error BigInt is not defined in the global scope
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

function bigIntMax(...args: bigint[]): bigint {
    return args.reduce((max, e) => {
        return e > max ? e : max;
    }, args[0]);
}

/**
 * get rating from flightstats and calculate payout amounts via smart contract call 
 * flightstats docs: https://developer.flightstats.com/api-docs/ratings/v1
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ carrier: string, flightNumber: string }> }
) {
    const reqId = nanoid();
    LOGGER.info(`[${reqId}] Quote request`);
    const params = await props.params;
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
    let hasCapacity = true;

    try {
        // calculate payout amounts via smart contract call
        const signer = await getBackendVoidSigner();
        payouts = await calculatePayoutAmounts(reqId, premium, rating, signer);
        hasCapacity = await checkCapacity(payouts, signer);
    } catch (err) {
        if (err instanceof CapacityError) {
            LOGGER.error(`[${reqId}] Not enough capacity for payout amounts`);
            return Response.json({ error: 'Not enough capacity for payout amounts' }, { status: 503 });
        } else {
            LOGGER.error(`[${reqId}] Error calculating payout amounts: ${err}`);
            return Response.json({ error: 'calculation of payout amounts failed' }, { status: 404 });
        }
    }

    return Response.json({
        premium, 
        payouts,
        ontimepercent: rating.ontimePercent,
        statistics: [rating.observations, rating.late15, rating.late30, rating.late45, rating.cancelled, rating.diverted],
    }, { status: hasCapacity ? 200 : 503 });
}

async function checkCapacity(payouts: PayoutAmounts, signer: Signer): Promise<boolean> {
    const flightPool = FlightPool__factory.connect(POOL_CONTRACT_ADDRESS, signer);
    const maxPayout = bigIntMax(payouts.delayed, payouts.cancelled, payouts.diverted);
    const availableCapacity = await getAvailableCapacity(flightPool, signer);
    LOGGER.debug(`available capacity: ${formatUnits(availableCapacity, 6)} max payout: ${formatUnits(maxPayout, 6)}`);
    return availableCapacity > maxPayout;
}

async function calculatePayoutAmounts(reqId: string, premium: bigint, rating: Rating, signer: Signer): Promise<PayoutAmounts> {
    LOGGER.debug(`[${reqId}] calling calculatePayoutAmounts ${premium}`);
    const productAddress = process.env.NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!;
    const flightProduct = FlightProduct__factory.connect(productAddress, signer);
    
    try {
        const result = await flightProduct.calculatePayoutAmounts(productAddress, premium, [rating.observations, rating.late15, rating.late30, rating.late45, rating.cancelled, rating.diverted]);
        const payouts = {
            delayed: result[1][2],
            cancelled: result[1][3],
            diverted: result[1][4],
        };
        LOGGER.info(`calculatePayoutAmounts => ${result[0].toString()}, ${result[1].toString()}, ${result[2].toString()}`);
        return payouts;
    } catch (err) {
        const errorDecoder = ErrorDecoder.create([
            FlightProduct__factory.createInterface(), 
            FlightUSD__factory.createInterface(),
            FlightOracle__factory.createInterface(),
            IPolicyService__factory.createInterface(),
            IPoolService__factory.createInterface(),
            IBundleService__factory.createInterface(),
            FlightLib__factory.createInterface(),
        ]);
        const decodedError = await errorDecoder.decode(err);
        LOGGER.error(`Decoded error reason: ${decodedError.reason}`);
        LOGGER.error(`Decoded error args: ${decodedError.args}`);
        throw err;
    }
}

async function fetchFlightstatsRating(reqId: string, carrier: string, flightNumber: string): Promise<Rating|null> {
    LOGGER.debug(`[${reqId}] fetching quote for ${carrier} ${flightNumber}`);

    const response = await sendRequestAndReturnResponse(reqId, flightstatsRatingsUrl(carrier, flightNumber));
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

