import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { sendRequestAndReturnResponse } from "../_utils/proxy";

const LOCATION_IQ_API_KEY = process.env.LOCATION_IQ_API_KEY;
const LOCATION_IQ_BASEURL = process.env.LOCATION_IQ_BASEURL ?? "https://api.locationiq.com";

export async function GET(request: NextRequest) {
    const reqId = nanoid();
    const query = request.nextUrl.searchParams.get('q');
    const url = `${LOCATION_IQ_BASEURL}/v1/autocomplete?key=${LOCATION_IQ_API_KEY}&q=${query}&limit=5&dedupe=1&tag=place%3A%2A`; // plase:* is a filter to only get places
    return sendRequestAndReturnResponse(reqId, url);
}
