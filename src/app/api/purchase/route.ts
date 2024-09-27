import { nanoid } from "nanoid";
import { LOGGER } from "../../../utils/logger_backend";

/**
 * purchase protection for a flight
 */
export async function GET(/*request: NextRequest, { params } : { params: { carrier: string, flightNumber: string,  TODO: additional fields } }*/ ) {
    // TODO: 0.1 adapt path to match with parameters required 
    // TODO: 0.2 switch to POST request

    const reqId = nanoid();
    // const carrier = params.carrier;
    // const flightNumber = params.flightNumber;
    LOGGER.debug(`[${reqId} purchase protection `);

    // TODO: 0. check balance for purchaser wallet and ensure enough tokens are available for payment
    // TODO: 1. call smart contract createPolicy function
    // TODO: 2. return nftid and policy data

    return Response.json({
    }, { status: 200 });
}
