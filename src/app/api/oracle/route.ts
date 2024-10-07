import { parseUnits, Signer } from "ethers";
import { nanoid } from "nanoid";
import { TransactionFailedException } from "../../../types/errors";
import { OracleRequest, OracleResponse } from "../../../types/oracle_request";
import { LOGGER } from "../../../utils/logger_backend";
import { getOracleSigner } from "../_utils/chain";

/**
 * purchase protection for a flight
 */
export async function POST(request: Request) {
    const jsonBody = await request.json() as OracleRequest;
    LOGGER.info(`oracle request: ${JSON.stringify(jsonBody)}`);
    
    const reqId = nanoid();
    LOGGER.debug(`[${reqId} oracle execution requested`);

    const signer = await getOracleSigner();
    try {
        await checkSignerBalance(signer);

        // TODO: FlightOracle.activeRequests -> number of active risks
        // TODO: loop all
        // TODO: getActiveRequest -> requestId
        //     TODO: InstanceReader.getRequestInfo(requestId)
        //     TODO: FlightOracle.decodeFlightStatusRequestData(requestInfo.requestData)
        //     TODO: fetch and decode riskinfo and FlightRisk from riskId FlightStatusRequest
        //     TODO: check if now > arrivalTime + N (configurable) -> if not, continue to next request
        //     TODO: call flightstats with info from flightData
        //     TODO: check response -> landed/cancelled/diverted, gate arrival delay
        //     TODO: FlightOracle.respondWithFlightStatus(...)
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

async function checkSignerBalance(signer: Signer) {
    const balance = await signer.provider?.getBalance(signer.getAddress());
    LOGGER.debug(`balance for application sender signer: ${balance}`);
    if (balance === undefined || balance < parseUnits(process.env.ORACLE_MIN_BALANCE! || "1", "wei")) {
        LOGGER.error(`insufficient balance for application sender signer: ${balance}`);
        throw new Error("BALANCE_ERROR");
    }
}


