import { LOGGER } from "../../../utils/logger_backend";
import { NextRequest } from "next/server";

/**
 * POST request will log a message that occured on the client side (supported fields are message)
 */
export async function POST(
    req: NextRequest
) {
    LOGGER.debug("POST request to /api/clientLog");
    const bodyData = await req.json();

    const message = bodyData.message as string;
    
    LOGGER.info("CLIENT LOG ==>  '" + message);
    
    return Response.json(JSON.stringify({}), { status: 200 });
}
