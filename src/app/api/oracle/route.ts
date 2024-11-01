import dayjs from "dayjs";
import { getNumber, hexlify, parseUnits, Signer, toUtf8Bytes } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { nanoid } from "nanoid";
import { FlightLib__factory, FlightOracle, FlightOracle__factory, FlightProduct, FlightProduct__factory, FlightUSD__factory } from "../../../contracts/flight";
import { IBundleService__factory, IInstance__factory, InstanceReader__factory, IOracleService__factory, IPolicyService__factory, IPoolService__factory } from "../../../contracts/gif";
import { FlightStatus } from "../../../types/flightstats/flightStatus";
import { OracleRequest, OracleResponse } from "../../../types/oracle_request";
import { getFieldFromLogs } from "../../../utils/chain";
import { LOGGER } from "../../../utils/logger_backend";
import { decodeOzShortString } from "../../../utils/oz_shortstring";
import { FLIGHTSTATS_BASE_URL, GAS_LIMIT, ORACLE_ARRIVAL_CHECK_DELAY_SECONDS, ORACLE_CONTRACT_ADDRESS, PRODUCT_CONTRACT_ADDRESS } from "../_utils/api_constants";
import { checkSignerBalance, getStatusProviderSigner, getTxOpts } from "../_utils/chain";
import { collectActiveRequestIds, processOracleRequest } from "../_utils/flight_oracle";
import { sendRequestAndReturnResponse } from "../_utils/proxy";

// @ts-expect-error BigInt is not defined in the global scope
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

/**
 * purchase protection for a flight
 */
export async function POST(request: Request) {
    const jsonBody = await request.json() as OracleRequest;
    LOGGER.info(`oracle request: ${JSON.stringify(jsonBody)}`);
    
    const reqId = nanoid();
    LOGGER.debug(`[${reqId}] oracle execution requested`);

    const signer = await getStatusProviderSigner();
    try {
        await hasBalance(signer);

        const flightProduct = FlightProduct__factory.connect(PRODUCT_CONTRACT_ADDRESS, signer);
        const flightOracle = FlightOracle__factory.connect(ORACLE_CONTRACT_ADDRESS, signer);
        const instanceAddress = await flightOracle.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, signer);
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, signer);

        const requestIds = await collectActiveRequestIds(reqId, flightOracle);

        // if status == null and request id !== null => resend request
        let oracleResponses = [] as { requestId: bigint, status: string | null, delay: number, riskId: string | null, flightPlan: string }[];
        for (const requestId of requestIds) {
            const requestState = await flightOracle.getRequestState(requestId);

            if (requestState.readyForResponse === false && requestState.waitingForResend === false) {
                continue;
            }

            if (requestState.readyForResponse) {
                LOGGER.debug(`[${reqId}] request ${requestId} is ready for response`);
                try {
                    const response = await processOracleRequest(reqId, flightProduct, flightOracle, instanceReader, requestId, checkFlightRisk);
                    if (response === null) {
                        continue;
                    }
                    if (response.delay === undefined) {
                        response.delay = 0;
                    }
                    oracleResponses.push(response);
                } catch (err) {
                    // @ts-expect-error error handling
                    LOGGER.error(`[${reqId}] ${err.message}`);
                    // @ts-expect-error error handling
                    LOGGER.error(`[${reqId}] ${err.stack}`);
                } finally {
                    // sleep 100ms to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } else if (requestState.waitingForResend) {
                LOGGER.debug(`[${reqId}] request ${requestId} is waiting for resend`);
                oracleResponses.push({ requestId, status: null, delay: 0, riskId: null, flightPlan: "" });
            }
        }

        // filter out null responses
        oracleResponses = oracleResponses.filter(response => response !== null);
        LOGGER.debug(`[${reqId}] responses: ${JSON.stringify(oracleResponses)}`);

        for (const response of oracleResponses) {
            let policiesRemaining = BigInt(0);

            if (response.status !== null) {
                policiesRemaining = await sendOracleResponse(reqId, flightOracle, response.requestId, response.status, response.delay, response.flightPlan);
            } else {
                policiesRemaining = await resendRequest(reqId, flightProduct, response.requestId);
            }

            LOGGER.debug(`[${reqId}] policies remaining: ${policiesRemaining}`);
    
            while (policiesRemaining !== null && policiesRemaining > 0) {
                policiesRemaining = await processPayoutsAndClosePolicies(reqId, flightProduct, response.riskId!);
                LOGGER.debug(`[${reqId}] policies remaining: ${policiesRemaining}`);
            }

            // sleep 100ms to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return Response.json({
            requestId: reqId,
        } as OracleResponse, { status: 200 });
    } catch (err) {
        LOGGER.error(err);
        throw err;
    }
}

async function checkFlightRisk(logReqId: string, flightRisk: FlightProduct.FlightRiskStruct, requestId: bigint, flightPlan: string): Promise<boolean> {
    // LOGGER.debug(JSON.stringify(flightRisk));
    const arrivalTimeUtc = flightRisk.arrivalTime;
    const nowUtc = dayjs.utc().unix();
    LOGGER.debug(`[${logReqId}] arrivalTime(utc): ${arrivalTimeUtc} (${dayjs.unix(getNumber(arrivalTimeUtc)).format()}) < now(utc): ${nowUtc} (${dayjs.unix(nowUtc).format()}) | delay ${ORACLE_ARRIVAL_CHECK_DELAY_SECONDS}s`);

    // 2. check flight should have arrives
    if (nowUtc < (getNumber(arrivalTimeUtc) + ORACLE_ARRIVAL_CHECK_DELAY_SECONDS)) {
        LOGGER.debug(`[${logReqId}] request ${requestId} not yet due`);
        return false;
    }

    // 3. fetch flight status 
    const {status, delay} = await fetchFlightStatus(logReqId, flightRisk);
    LOGGER.info(`[${logReqId}] flight status: ${status}, delay: ${delay} - flightPlan: ${flightPlan}`);

    switch (status) {
        case 'S': // scheduled
        case 'A': // active
            return false;
            
        case 'L': // landed
        case 'C': // cancelled
        case 'D': // diverted
            return true;

        default:
            LOGGER.error(`[${logReqId}] unknown flight status: ${status}`);
            throw new Error("FLIGHT_STATUS_UNKNOWN");
    }
}

async function fetchFlightStatus(reqId: string, flightRisk: FlightProduct.FlightRiskStruct): 
    Promise<{ status: string, delay: number | undefined}> 
{
    LOGGER.debug(`[${reqId}] flight data: ${flightRisk.flightData}`);
    const x = decodeOzShortString(flightRisk.flightData);
    LOGGER.debug(`[${reqId}] flight data decoded: ${x}`);
    const flightPlan = x.trim().split(" ");
    const carrier = flightPlan[0];
    const flightNumber = flightPlan[1];
    const departureDate = flightPlan[4];
    LOGGER.debug(`[${reqId}] fetching flight data for ${carrier}/${flightNumber}/${departureDate}`);
    
    const year = departureDate.substring(0, 4);
    const month = departureDate.substring(4, 6);
    const day = departureDate.substring(6, 8);
    const statusUrl = FLIGHTSTATS_BASE_URL + '/flightstatus/rest/v2/json/flight/status';
    const url = `${statusUrl}/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}` 
        + `/dep/${encodeURIComponent(year)}/${encodeURIComponent(month)}/${encodeURIComponent(day)}`
        + `?appId=${process.env.FLIGHTSTATS_APP_ID}&appKey=${process.env.FLIGHTSTATS_APP_KEY}`;
    
    const response = await sendRequestAndReturnResponse(reqId, url);
    const responseJSON = await response.json();
    // LOGGER.debug(`[${reqId}] raw response (json): ${JSON.stringify(responseJSON)}`);

    if (responseJSON.flightStatuses === undefined) {
        throw new Error("FLIGHT_STATUS_NOT_FOUND");
    }
    const flightstatus = responseJSON.flightStatuses[0] as FlightStatus;

    return { status: flightstatus.status, delay: flightstatus.delays?.arrivalGateDelayMinutes };
}

async function sendOracleResponse(reqId: string, flightOracle: FlightOracle, requestId: bigint, status: string, delay: number, flightPlan: string): Promise<bigint> {
    LOGGER.debug(`[${reqId}] responding to request ${requestId} with status ${status} and delay ${delay} (${flightPlan})`);

    try {
        const txOpts = getTxOpts();
        txOpts['gasLimit'] = GAS_LIMIT;

        const txResp = await flightOracle.respondWithFlightStatus(
            requestId, 
            hexlify(toUtf8Bytes(status)), 
            delay,
            txOpts);
        
        LOGGER.debug(`[${reqId}] waiting for tx: ${txResp.hash}`);
        const tx = await txResp.wait();
        LOGGER.debug(`[${reqId}] respondWithFlightStatus tx: ${tx!.hash}`);

        if (tx === null) {
            LOGGER.error(`[${reqId}] transaction failed`);
            return BigInt(0);
        }

        if (tx.status !== 1) {
            LOGGER.error(`[${reqId}] transaction failed. ${JSON.stringify(tx)}`);
            return BigInt(0);
        }

            LOGGER.info(`[${reqId}] finished oracle response to request ${requestId} with status ${status} and delay ${delay} (${flightPlan}). tx ${tx.hash}`);

        return getFieldFromLogs(tx.logs, FlightProduct__factory.createInterface(), "LogFlightPoliciesProcessed", "policiesRemaining") as bigint;
    } catch (err) {
        const errorDecoder = ErrorDecoder.create([
            FlightProduct__factory.createInterface(), 
            FlightOracle__factory.createInterface(),
            FlightUSD__factory.createInterface(),
            IOracleService__factory.createInterface(),
            IPolicyService__factory.createInterface(),
            IPoolService__factory.createInterface(),
            IBundleService__factory.createInterface(),
            FlightLib__factory.createInterface(),
        ]);
        const decodedError = await errorDecoder.decode(err);
        if (decodedError.reason !== null) {
            LOGGER.error(`[${reqId}] Decoded error reason: ${decodedError.reason}`);
            LOGGER.error(`[${reqId}] Decoded error args: ${decodedError.args}`);
        } else {
            LOGGER.error(`[${reqId}] unexpected error: ${err}`);
        }
        return BigInt(0);
    }
}

async function resendRequest(reqId: string, flightProduct: FlightProduct, requestId: bigint): Promise<bigint> {
    LOGGER.debug(`[${reqId}] resending request ${requestId}`);

    try {
        const txOpts = getTxOpts();
        txOpts['gasLimit'] = GAS_LIMIT;

        const txResp = await flightProduct.resendRequest(requestId, getTxOpts());
        
        LOGGER.debug(`[${reqId}] waiting for tx: ${txResp.hash}`);
        const tx = await txResp.wait();
        LOGGER.debug(`[${reqId}] respondWithFlightStatus tx: ${tx!.hash}`);

        if (tx === null) {
            LOGGER.error(`[${reqId}] transaction failed`);
            return BigInt(0);
        }

        if (tx.status !== 1) {
            LOGGER.error(`[${reqId}] transaction failed. ${JSON.stringify(tx)}`);
            return BigInt(0);
        }

        LOGGER.info(`[${reqId}] resend request ${requestId}. tx ${tx.hash}`);

        return getFieldFromLogs(tx.logs, FlightProduct__factory.createInterface(), "LogFlightPoliciesProcessed", "policiesRemaining") as bigint;
    } catch (err) {
        const errorDecoder = ErrorDecoder.create([
            FlightProduct__factory.createInterface(), 
            FlightUSD__factory.createInterface(),
            IOracleService__factory.createInterface(),
            IPolicyService__factory.createInterface(),
            IPoolService__factory.createInterface(),
            IBundleService__factory.createInterface(),
            FlightLib__factory.createInterface(),
        ]);
        const decodedError = await errorDecoder.decode(err);
        if (decodedError.reason !== null) {
            LOGGER.error(`[${reqId}] Decoded error reason: ${decodedError.reason}`);
            LOGGER.error(`[${reqId}] Decoded error args: ${decodedError.args}`);
        } else {
            LOGGER.error(`[${reqId}] unexpected error: ${err}`);
        }
        return BigInt(0);
    }
}

async function processPayoutsAndClosePolicies(reqId: string, flightProduct: FlightProduct, riskId: string): Promise<bigint> {
    LOGGER.debug(`[${reqId}] processsing payouts for risk ${riskId}`);

    try {
        const txOpts = getTxOpts();
        txOpts['gasLimit'] = GAS_LIMIT;

        const txResp = await flightProduct.processPayoutsAndClosePolicies(riskId, 2, txOpts);
        
        LOGGER.debug(`[${reqId}] waiting for tx: ${txResp.hash}`);
        const tx = await txResp.wait();
        LOGGER.debug(`[${reqId}] processPayoutsAndClosePolicies tx: ${tx!.hash}`);

        if (tx === null) {
            LOGGER.error(`[${reqId}] transaction failed`);
            return BigInt(0);
        }

        if (tx.status !== 1) {
            LOGGER.error(`[${reqId}] transaction failed. ${JSON.stringify(tx)}`);
            return BigInt(0);
        }

        LOGGER.info(`[${reqId}] finished processPayoutsAndClosePolicies for risk ${riskId}`);

        return getFieldFromLogs(tx.logs, FlightProduct__factory.createInterface(), "LogFlightPoliciesProcessed", "policiesRemaining") as bigint;
    } catch (err) {
        const errorDecoder = ErrorDecoder.create([
            FlightProduct__factory.createInterface(), 
            FlightOracle__factory.createInterface(),
            FlightUSD__factory.createInterface(),
            IOracleService__factory.createInterface(),
            IPolicyService__factory.createInterface(),
            IPoolService__factory.createInterface(),
            IBundleService__factory.createInterface(),
        ]);
        const decodedError = await errorDecoder.decode(err);
        if (decodedError.reason !== null) {
            LOGGER.error(`[${reqId}] Decoded error reason: ${decodedError.reason}`);
            LOGGER.error(`[${reqId}] Decoded error args: ${decodedError.args}`);
        } else {
            LOGGER.error(`[${reqId}] unexpected error: ${err}`);
        }
        return BigInt(0);
    }
}


async function hasBalance(signer: Signer) {
    const minBalance = parseUnits(process.env.STATUS_PROVIDER_MIN_BALANCE! || "1", "wei");
    if (! await checkSignerBalance(signer, minBalance)) {
        throw new Error("BALANCE_ERROR");
    }
}



