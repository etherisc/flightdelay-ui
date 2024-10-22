import { hexlify, parseUnits, Signer, toUtf8Bytes } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { nanoid } from "nanoid";
import { FlightLib__factory, FlightOracle__factory, FlightProduct__factory, FlightUSD__factory } from "../../../contracts/flight";
import { IPolicyService__factory } from "../../../contracts/gif";
import { IBundleService__factory, IPoolService__factory } from "../../../contracts/gif/factories/pool";
import { TransactionFailedException } from "../../../types/errors";
import { ApplicationData, PermitData, PurchaseRequest } from "../../../types/purchase_request";
import { LOGGER } from "../../../utils/logger_backend";
import { PRODUCT_CONTRACT_ADDRESS } from "../_utils/api_constants";
import { checkSignerBalance, getApplicationSenderSigner, getTxOpts } from "../_utils/chain";

/**
 * purchase protection for a flight
 */
export async function POST(request: Request) {
    const jsonBody = await request.json() as PurchaseRequest;
    
    const reqId = nanoid();
    LOGGER.debug(`[${reqId} purchase protection for flight ${jsonBody.application.carrier} ${jsonBody.application.flightNumber} ${jsonBody.application.departureDate}`);

    const signer = await getApplicationSenderSigner();
    try {
        await hasBalance(signer);

        const permit = preparePermitData(jsonBody.permit);
        const applicationData = prepareApplicationData(jsonBody.application);

        const { tx } = await createPolicy(signer, permit, applicationData);
        return Response.json({
            tx
        }, { status: 202 });
    } catch (err) {
        LOGGER.error(err);
        if (err instanceof TransactionFailedException) {
            return Response.json({
                error: "TX_FAILED",
                transaction: err.transaction,
                decodedError: err.decodedError,
            }, { status: 500 });
        } else {
            // @ts-expect-error balance error
            if (err.message === "BALANCE_ERROR") {
                return Response.json({
                    error: "BALANCE_ERROR"
                }, { status: 500 });
            } else {
                return Response.json({
                    error: "unexpected error occured",
                    // @ts-expect-error unknown error
                    message: err.message,
                }, { status: 500 });
            }
        }
    }
}

async function hasBalance(signer: Signer) {
    const minBalance = parseUnits(process.env.STATISTICS_PROVIDER_MIN_BALANCE! || "1", "wei");
    if (! await checkSignerBalance(signer, minBalance)) {
        throw new Error("BALANCE_ERROR");
    }
}

function preparePermitData(permit: PermitData) {
    LOGGER.debug(`preparePermitData`);
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
    const flightDataString = `${application.carrier} ${application.flightNumber} ${application.departureAirport} ${application.arrivalAirport} ${application.departureDate}`;
    LOGGER.debug(`prepareApplicationData flightData: ${flightDataString}, departureTimeLocal:${application.departureTimeLocal}, arrivalTimeLocal:${application.arrivalTimeLocal}`);

    return {
        flightData: flightDataString,
        departureTime: application.departureTime,
        departureTimeLocal: hexlify(toUtf8Bytes(application.departureTimeLocal)),
        arrivalTime: application.arrivalTime,
        arrivalTimeLocal: hexlify(toUtf8Bytes(application.arrivalTimeLocal)),
        premiumAmount: application.premiumAmount,
        statistics: application.statistics,
        v: application.v,
        r: application.r,
        s: application.s,
    }
}


async function createPolicy(
    signer: Signer,
    permit: { owner: string; spender: string; value: bigint; deadline: number; v: number; r: string; s: string; }, 
    applicationData: { flightData: string; departureTime: number; departureTimeLocal: string, arrivalTime: number; arrivalTimeLocal: string, premiumAmount: bigint; statistics: bigint[]; v: number; r: string; s: string; 
}): Promise<{ tx: string }> {
    LOGGER.debug(`createPolicy for ${applicationData.flightData}`);
    LOGGER.debug(`permit: ${JSON.stringify(permit)}`);
    LOGGER.debug(`applicationData: ${JSON.stringify(applicationData)}`);
    const productAddress = PRODUCT_CONTRACT_ADDRESS;

    const flightProduct = FlightProduct__factory.connect(productAddress, signer);
    LOGGER.debug(`=> createPolicyWithPermit`);

    try {
        const txResp = await flightProduct.createPolicyWithPermit(permit, applicationData, getTxOpts());
        LOGGER.debug(`waiting for tx: ${txResp.hash}`);
        return { tx: txResp.hash };
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
        throw new TransactionFailedException(null, decodedError);
    }
}

