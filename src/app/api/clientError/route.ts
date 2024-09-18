import { LOGGER } from "../../../utils/logger_backend";
import { NextRequest } from "next/server";

/**
 * POST request will log an error that occured on the client side (supported fields are message, stack, action, client_timestamp)
 */
export async function POST(
    req: NextRequest
) {
    LOGGER.debug("POST request to /api/client_error");
    const bodyData = await req.json();

    const message = bodyData.message as string;
    const stack = bodyData.stack as string;
    const action = bodyData.action as string;
    const client_timestamp = bodyData.client_timestamp as number || 0;
    
    LOGGER.error("client side error occured during action '" + action 
        + "'\n======\n" 
        + message 
        + "\n------\n" 
        + stack 
        + "\n------\n" 
        + client_timestamp + " / " + new Date(client_timestamp).toLocaleString()
        + "\n======\n");
    
    return Response.json(JSON.stringify({}), { status: 200 });
}
