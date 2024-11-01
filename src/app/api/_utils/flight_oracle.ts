import { getNumber } from "ethers";
import { FlightOracle, FlightProduct } from "../../../contracts/flight";
import { LOGGER } from "../../../utils/logger_backend";
import { InstanceReader } from "../../../contracts/gif";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { decodeOzShortString } from "../../../utils/oz_shortstring";

export async function collectActiveRequestIds(reqId: string, flightOracle: FlightOracle): Promise<bigint[]> {
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

export async function processOracleRequest(
    reqId: string, 
    flightProduct: FlightProduct, 
    flightOracle: FlightOracle, 
    instanceReader: InstanceReader, 
    requestId: bigint,
    evaluateRisk: (logReqId: string, flightRisk: FlightProduct.FlightRiskStruct, requestId: bigint, flightPlan: string) => Promise<boolean> 
): Promise<{ requestId: bigint, status: string, delay: number, riskId: string, flightPlan: string, flightRisk: FlightProduct.FlightRiskStruct } | null> {
    // this needs to be done per thread
    dayjs.extend(utc);
    dayjs.extend(timezone);
    LOGGER.debug(`[${reqId}] processing request ${requestId}`);

    // 1. extract flight risk from oracle request data
    const { risk: flightRisk, riskId, flightPlan } = await readFlightRisk(instanceReader, flightProduct, flightOracle, requestId);

    if (await evaluateRisk(reqId, flightRisk, requestId, flightPlan)) {
        return { requestId, status: "L", delay: 0, riskId, flightPlan, flightRisk };
    } else {
        return null;
    }
}

async function readFlightRisk(instanceReader: InstanceReader, flightProduct: FlightProduct, flightOracle: FlightOracle, requestId: bigint): Promise<{ riskId: string, risk: FlightProduct.FlightRiskStruct, flightPlan: string}> {
    const requestInfo = await instanceReader.getRequestInfo(requestId);
    // LOGGER.debug(JSON.stringify(requestInfo.requestData));
    const requestData = await flightOracle.decodeFlightStatusRequestData(requestInfo.requestData);
    // LOGGER.debug(JSON.stringify(requestData));
    const riskInfo = await instanceReader.getRiskInfo(requestData.riskId);
    // LOGGER.debug(JSON.stringify(riskInfo));
    const risk = await flightProduct.decodeFlightRiskData(riskInfo.data);
    // LOGGER.debug(JSON.stringify(risk.flightData));
    const flightPlan = decodeOzShortString(risk.flightData).trim();
    // const flightPlan = (await instanceReader.toString(risk.flightData)).trim();
    return { riskId: requestData.riskId, risk, flightPlan };
}
