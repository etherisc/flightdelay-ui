import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { sendRequestAndReturnResponse } from "../_utils/proxy";
import { BASE_URL_Q_API, BASE_URL_Q_API_APPLICATION_API, RICHTERX_TOKEN } from "../_utils/base_urls";
import { AxiosHeaders } from "axios";


export async function POST(request: NextRequest) {
    const reqId = nanoid();
    const baseUrl = BASE_URL_Q_API_APPLICATION_API !== undefined ? BASE_URL_Q_API_APPLICATION_API : BASE_URL_Q_API;
    let url = `${baseUrl}/api/v1/application`;
    if (RICHTERX_TOKEN !== undefined) {
        url += `?token=${RICHTERX_TOKEN}`;
    }
    const body = await request.text();
    const headers = {
        'content-type': 'application/json'
    };
    return sendRequestAndReturnResponse(reqId, url, 'POST', body, AxiosHeaders.from(headers));
}
