import { nanoid } from "nanoid";
import { LOGGER } from "../../../../utils/logger_backend";

export async function GET() {
    const logReqId = nanoid();
    LOGGER.info(`[${logReqId}] Liveness check`);
    
    // no external dependencies, just return ok
    return Response.json({
    }, { status: 200 });
}
