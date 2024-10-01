import { encodeBytes32String } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { nanoid } from "nanoid";
import { FlightOracle__factory, FlightProduct__factory, FlightUSD__factory } from "../../../contracts/flight";
import { IPolicyService__factory } from "../../../contracts/gif";
import { TransactionFailedException } from "../../../types/errors";
import { ApplicationData, PermitData, PurchaseRequest } from "../../../types/purchase_request";
import { LOGGER } from "../../../utils/logger_backend";
import { getApplicationSenderSigner } from "../_utils/chain";
import { IBundleService__factory, IPoolService__factory } from "../../../contracts/gif/factories/pool";
import { IPricingService__factory } from "../../../contracts/gif/factories/product";

/**
 * purchase protection for a flight
 */
export async function POST(request: Request) {
    const jsonBody = await request.json() as PurchaseRequest;
    

    const reqId = nanoid();
    LOGGER.debug(`[${reqId} purchase protection for flight ${jsonBody.application.carrier} ${jsonBody.application.flightNumber} ${jsonBody.application.departureDate}`);

    // TODO: 0. check balance for purchaser wallet and ensure enough tokens are available for payment

    const permit = preparePermitData(jsonBody.permit);
    const applicationData = prepareApplicationData(jsonBody.application);

    try {
        await createPolicy(permit, applicationData);

        // TODO: 2. return nftid and policy data

        return Response.json({
        }, { status: 200 });
    } catch (err) {
        LOGGER.error(err);
        return Response.json({
            error: "error occured",
        }, { status: 500 });
    }
}

function preparePermitData(permit: PermitData) {
    return {
        owner: permit.owner,
        spender: permit.spender,
        value: permit.value,
        deadline: permit.deadline,
        v: permit.v,
        r: permit.r,
        s: permit.s,
    }
}

function prepareApplicationData(application: ApplicationData) {
    return {
        flightData: encodeBytes32String(`${application.carrier} ${application.flightNumber} ${application.departureAirport} ${application.arrivalAirport} ${application.departureDate}`),
        departureTime: application.departureTime,
        arrivalTime: application.arrivalTime,
        premiumAmount: application.premiumAmount,
        statistics: application.statistics,
        v: application.v,
        r: application.r,
        s: application.s,
    }
}

async function createPolicy(
    permit: { owner: string; spender: string; value: bigint; deadline: number; v: number; r: string; s: string; }, 
    applicationData: { flightData: string; departureTime: number; arrivalTime: number; premiumAmount: bigint; statistics: bigint[]; v: number; r: string; s: string; 
}) {
    LOGGER.debug(`createPolicy for ${applicationData.flightData}`);
    LOGGER.debug(`permit: ${JSON.stringify(permit)}`);
    LOGGER.debug(`applicationData: ${JSON.stringify(applicationData)}`);
    const signer = await getApplicationSenderSigner();
    const productAddress = process.env.NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!;

    const flightProduct = FlightProduct__factory.connect(productAddress, signer);
    LOGGER.debug(`=> createPolicyWithPermit`);

    try {
        const txResp = await flightProduct.createPolicyWithPermit(permit, applicationData);
        LOGGER.debug(``);
        const tx = await txResp.wait();
        LOGGER.debug(`createPolicy tx: ${tx!.hash}`);

        if (tx === null) {
            throw new TransactionFailedException(null);
        }

        if (tx.status !== 1) {
            throw new TransactionFailedException(tx);
        }
    } catch (err) {
        const errorDecoder = ErrorDecoder.create([
            FlightProduct__factory.createInterface(), 
            FlightUSD__factory.createInterface(),
            FlightOracle__factory.createInterface(),
            IPolicyService__factory.createInterface(),
            IPoolService__factory.createInterface(),
            IBundleService__factory.createInterface(),
            IPricingService__factory.createInterface(),
        ]);
        const decodedError = await errorDecoder.decode(err);
        LOGGER.error(`Decoded error reason: ${decodedError.reason}`);
        LOGGER.error(`Decoded error args: ${decodedError.args}`);
        throw err;
    }
}

