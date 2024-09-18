import axios, { AxiosHeaders } from "axios";
import { LOGGER } from "../../../utils/logger_backend";

const LOG_API_PROXY = process.env.LOG_API_PROXY ?? "false";

export async function sendRequestAndReturnResponse(reqId: string, url: string, method?: string, body?: string, headers? : AxiosHeaders) {
    if (LOG_API_PROXY.toLowerCase() === "true") {
        LOGGER.info(`proxy request ==> ${method ?? 'GET'} ${url}`, { reqId });
    }
    const before = Date.now();
    const proxyResponse = await axios({
        url: url,
        method: method ?? 'GET', 
        data: body,
        headers: headers,
    });
    const after = Date.now();
    if (LOG_API_PROXY.toLowerCase() === "true") {
        LOGGER.info(`proxy response <== ${proxyResponse.status}`, { reqId, proxyRequestDuration: after - before });
    }
    const respJson = await proxyResponse.data;
    return Response.json(
        respJson, 
        { 
            status: proxyResponse.status, 
            headers: { 'Content-Type': 'application/json', 'X-Proxy-Request-Id': reqId } 
        });
}
