import axios, { AxiosHeaders, isAxiosError } from "axios";
import { LOGGER } from "../../../utils/logger_backend";

const LOG_API_PROXY = process.env.LOG_API_PROXY ?? "false";

export async function sendRequestAndReturnResponse(reqId: string, url: string, method?: string, body?: string, headers? : AxiosHeaders) {
    if (LOG_API_PROXY.toLowerCase() === "true") {
        LOGGER.debug(`proxy request ==> ${method ?? 'GET'} ${url}`, { reqId });
    }
    const before = Date.now();
    let proxyResponse;
    try {
        proxyResponse = await axios({
            url: url,
            method: method ?? 'GET',
            data: body,
            headers: headers,
            validateStatus: () => true, // accept all status codes, handle errors explicitly
        });
    } catch (error) {
        const after = Date.now();
        const errMsg = isAxiosError(error) ? `${error.code}: ${error.message}` : String(error);
        LOGGER.error(`proxy error <== ${errMsg}`, { reqId, proxyRequestDuration: after - before });
        return Response.json(
            { error: 'proxy_request_failed', message: errMsg },
            {
                status: 502,
                headers: { 'Content-Type': 'application/json', 'X-Proxy-Request-Id': reqId }
            });
    }
    const after = Date.now();
    if (LOG_API_PROXY.toLowerCase() === "true") {
        LOGGER.debug(`proxy response <== ${proxyResponse.status}`, { reqId, proxyRequestDuration: after - before });
    }
    const respJson = await proxyResponse.data;
    return Response.json(
        respJson,
        {
            status: proxyResponse.status,
            headers: { 'Content-Type': 'application/json', 'X-Proxy-Request-Id': reqId }
        });
}
