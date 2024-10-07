import { getNumber, parseUnits, Signer } from "ethers";
import { nanoid } from "nanoid";
import { TransactionFailedException } from "../../../types/errors";
import { OracleRequest, OracleResponse } from "../../../types/oracle_request";
import { LOGGER } from "../../../utils/logger_backend";
import { getOracleSigner } from "../_utils/chain";
import { FlightOracle, FlightOracle__factory, FlightProduct, FlightProduct__factory } from "../../../contracts/flight";
import { IInstance__factory, InstanceReader, InstanceReader__factory } from "../../../contracts/gif";
import { ORACLE_CONTRACT_ADDRESS, PRODUCT_CONTRACT_ADDRESS } from "../_utils/api_constants";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

/**
 * purchase protection for a flight
 */
export async function POST(request: Request) {
    const jsonBody = await request.json() as OracleRequest;
    LOGGER.info(`oracle request: ${JSON.stringify(jsonBody)}`);
    
    const reqId = nanoid();
    LOGGER.debug(`[${reqId}] oracle execution requested`);

    const signer = await getOracleSigner();
    try {
        await checkSignerBalance(signer);

        const flightProduct = FlightProduct__factory.connect(PRODUCT_CONTRACT_ADDRESS, signer);
        const flightOracle = FlightOracle__factory.connect(ORACLE_CONTRACT_ADDRESS, signer);
        const instanceAddress = await flightOracle.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, signer);
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, signer);
        const requestIds = await collectActiveRequestIds(reqId, flightOracle);

        await Promise.all(requestIds.map(async requestId => {
            const response = await processOracleRequest(reqId, flightProduct, flightOracle, instanceReader, requestId);
            if (response === null) {
                return;
            }
            // TODO: FlightOracle.respondWithFlightStatus(...)
        }));
        
        // TODO: after oracle has completed
        // TODO: if InstanceReader.policiesForRisk() > 0
        // TODO: call FlightProduct.processRisk (not yet implemented on product)
        
        return Response.json({
            requestId: reqId,
        } as OracleResponse, { status: 200 });
    } catch (err) {
        LOGGER.error(err);
        if (err instanceof TransactionFailedException) {
            return Response.json({
                requestId: reqId,
                error: "TX_FAILED"
            } as OracleResponse, { status: 500 });
        } else {
            // @ts-expect-error balance error
            if (err.message === "BALANCE_ERROR") {
                return Response.json({
                    requestId: reqId,
                    error: "BALANCE_ERROR"
                } as OracleResponse, { status: 500 });
            } else {
                return Response.json({
                    requestId: reqId,
                    // @ts-expect-error unknown error
                    error: err.message,
                } as OracleResponse, { status: 500 });
            }
        }
    }
}

async function collectActiveRequestIds(reqId: string, flightOracle: FlightOracle): Promise<bigint[]> {
    const activeRequests = await flightOracle.activeRequests();
    LOGGER.debug(`active requests: ${activeRequests}`);
    const requestIds = [] as bigint[];
    await Promise.allSettled([...Array(getNumber(activeRequests))].map(async (_, i) => {
        const requestId = await flightOracle.getActiveRequest(i);
        requestIds.push(requestId);
    }));
    LOGGER.debug(`[${reqId}] requestIds: ${requestIds}`);
    return requestIds;
}

async function processOracleRequest(
    reqId: string, 
    flightProduct: FlightProduct, 
    flightOracle: FlightOracle, 
    instanceReader: InstanceReader, 
    requestId: bigint
): Promise<{ requestId: bigint } | null> {
    LOGGER.debug(`[${reqId}] processing request ${requestId}`);
    const requestInfo = await instanceReader.getRequestInfo(requestId);
    LOGGER.debug(requestInfo.requestData);
    const requestData = await flightOracle.decodeFlightStatusRequestData(requestInfo.requestData);
    LOGGER.debug(2);
    const riskInfo = await instanceReader.getRiskInfo(requestData.riskId);
    LOGGER.debug(3);
    const flightRisk = await flightProduct.decodeFlightRiskData(riskInfo.data);
    LOGGER.debug(4);
    const arrivalTimeUtc = flightRisk.arrivalTime;
    const nowUtc = dayjs.extend(utc).utc().unix();
    LOGGER.debug(`[${reqId}] arrivalTime(utc): ${arrivalTimeUtc}, now(utc): ${nowUtc}`);
    if (nowUtc < arrivalTimeUtc) {
        LOGGER.debug(`[${reqId}] request ${requestId} not yet due`);
        return null;
    }
    //     InstanceReader.getRequestInfo(requestId)
    //     FlightOracle.decodeFlightStatusRequestData(requestInfo.requestData)
    //     fetch and decode riskinfo and FlightRisk from riskId FlightStatusRequest
    //     check if now > arrivalTime + N (configurable) -> if not, continue to next request
    //     TODO: call flightstats with info from flightData
    //     TODO: check response -> landed/cancelled/diverted, gate arrival delay
    return null;
}

async function checkSignerBalance(signer: Signer) {
    const balance = await signer.provider?.getBalance(signer.getAddress());
    LOGGER.debug(`balance for application sender signer: ${balance}`);
    if (balance === undefined || balance < parseUnits(process.env.ORACLE_MIN_BALANCE! || "1", "wei")) {
        LOGGER.error(`insufficient balance for application sender signer: ${balance}`);
        throw new Error("BALANCE_ERROR");
    }
}


