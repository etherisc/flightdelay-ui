import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { decodeBytes32String, getNumber, hexlify, parseUnits, Signer, toUtf8Bytes } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { nanoid } from "nanoid";
import { FlightOracle, FlightOracle__factory, FlightProduct, FlightProduct__factory, FlightUSD__factory } from "../../../contracts/flight";
import { IBundleService__factory, IInstance__factory, InstanceReader, InstanceReader__factory, IOracleService__factory, IPolicyService__factory, IPoolService__factory } from "../../../contracts/gif";
import { FlightStatus } from "../../../types/flightstats/flightStatus";
import { OracleRequest, OracleResponse } from "../../../types/oracle_request";
import { LOGGER } from "../../../utils/logger_backend";
import { FLIGHTSTATS_BASE_URL, ORACLE_ARRIVAL_CHECK_DELAY_SECONDS, ORACLE_CONTRACT_ADDRESS, PRODUCT_CONTRACT_ADDRESS } from "../_utils/api_constants";
import { getOracleSigner } from "../_utils/chain";
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

        // let oracleResponses = await Promise.all(requestIds.map(async requestId => {
        let oracleResponses = [] as { requestId: bigint, status: string, delay: number }[];
        for (const requestId of requestIds) {
            try {
                const response = await processOracleRequest(reqId, flightProduct, flightOracle, instanceReader, requestId);
                if (response === null) {
                    continue;
                }
                oracleResponses.push(response);
            } catch (err) {
                // @ts-expect-error error handling
                LOGGER.error(`[${reqId}] ${err.message}`);
                // @ts-expect-error error handling
                LOGGER.error(`[${reqId}] ${err.stack}`);
                return null;
            }
        }

        // filter out null responses
        oracleResponses = oracleResponses.filter(response => response !== null);
        LOGGER.debug(`[${reqId}] responses: ${JSON.stringify(oracleResponses)}`);

        for (const response of oracleResponses) {
            if (response === null) {
                continue;
            }
            await sendOracleResponse(reqId, flightOracle, response.requestId, response.status, response.delay);
        }
        
        // TODO: after oracle has completed
        // TODO: if InstanceReader.policiesForRisk() > 0
        // TODO: call FlightProduct.processRisk (not yet implemented on product)
        
        return Response.json({
            requestId: reqId,
        } as OracleResponse, { status: 200 });
    } catch (err) {
        LOGGER.error(err);
        throw err;
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
    LOGGER.debug(`[${reqId}] active requestIds: ${requestIds}`);
    return requestIds;
}

async function processOracleRequest(
    reqId: string, 
    flightProduct: FlightProduct, 
    flightOracle: FlightOracle, 
    instanceReader: InstanceReader, 
    requestId: bigint
): Promise<{ requestId: bigint, status: string, delay: number } | null> {
    // this needs to be done per thread
    dayjs.extend(utc);
    dayjs.extend(timezone);
    LOGGER.debug(`[${reqId}] processing request ${requestId}`);

    // 1. extract flight risk from oracle request data
    const flightRisk = await readFlightRisk(instanceReader, flightProduct, flightOracle, requestId);
    // LOGGER.debug(JSON.stringify(flightRisk));
    const arrivalTimeUtc = flightRisk.arrivalTime;
    const nowUtc = dayjs.utc().unix();
    LOGGER.debug(`[${reqId}] arrivalTime(utc): ${arrivalTimeUtc} (${dayjs.unix(getNumber(arrivalTimeUtc)).format()}) < now(utc): ${nowUtc} (${dayjs.unix(nowUtc).format()}) | delay ${ORACLE_ARRIVAL_CHECK_DELAY_SECONDS}s`);

    // 2. check flight should have arrives
    if (nowUtc < (getNumber(arrivalTimeUtc) + ORACLE_ARRIVAL_CHECK_DELAY_SECONDS)) {
        LOGGER.debug(`[${reqId}] request ${requestId} not yet due`);
        return null;
    }

    // 3. fetch flight status 
    const {status, delay} = await fetchFlightStatus(reqId, flightRisk);
    // LOGGER.debug(`[${reqId}] flight status: ${JSON.stringify(flightstatus)}`);
    LOGGER.info(`[${reqId}] flight status: ${status}, delay: ${delay}`);

    switch (status) {
        case 'S': // scheduled
        case 'A': // active
            return null;
            
        case 'L': // landed
            if (delay === undefined) {
                LOGGER.info(`[${reqId}] flight landed without delay`);
                return { requestId, status, delay: 0 };
            }
            return { requestId, status, delay };

        case 'C': // cancelled
        case 'D': // diverted
            // this case might not include a delay
            return { requestId, status, delay: delay || 0 }; 

        default:
            LOGGER.error(`[${reqId}] unknown flight status: ${status}`);
            throw new Error("FLIGHT_STATUS_UNKNOWN");
    }
    return null;
}

async function readFlightRisk(instanceReader: InstanceReader, flightProduct: FlightProduct, flightOracle: FlightOracle, requestId: bigint): Promise<FlightProduct.FlightRiskStruct> {
    const requestInfo = await instanceReader.getRequestInfo(requestId);
    // LOGGER.debug(JSON.stringify(requestInfo.requestData));
    const requestData = await flightOracle.decodeFlightStatusRequestData(requestInfo.requestData);
    // LOGGER.debug(JSON.stringify(requestData));
    const riskInfo = await instanceReader.getRiskInfo(requestData.riskId);
    // LOGGER.debug(JSON.stringify(riskInfo));
    return await flightProduct.decodeFlightRiskData(riskInfo.data);
}

async function fetchFlightStatus(reqId: string, flightRisk: FlightProduct.FlightRiskStruct): 
    Promise<{ status: string, delay: number | undefined}> 
{
    const x = decodeBytes32String(flightRisk.flightData);
    // LOGGER.debug(`[${reqId}] flight data: ${x}`);
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

async function sendOracleResponse(reqId: string, flightOracle: FlightOracle, requestId: bigint, status: string, delay: number) {
    LOGGER.debug(`[${reqId}] responding to request ${requestId} with status ${status} and delay ${delay}`);

    try {
        const txResp = await flightOracle.respondWithFlightStatus(
            requestId, 
            hexlify(toUtf8Bytes(status)), 
            delay);
        
        LOGGER.debug(`[${reqId}] waiting for tx: ${txResp.hash}`);
        const tx = await txResp.wait();
        LOGGER.debug(`[${reqId}] respondWithFlightStatus tx: ${tx!.hash}`);

        if (tx === null) {
            LOGGER.error(`[${reqId}] transaction failed`);
            return;
        }

        if (tx.status !== 1) {
            LOGGER.error(`[${reqId}] transaction failed. ${JSON.stringify(tx)}`);
            return;
        }

        LOGGER.info(`[${reqId}] finished oracle response to request ${requestId} with status ${status} and delay ${delay}`);
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
        return null;
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



