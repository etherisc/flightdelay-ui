import { formatUnits, parseUnits } from "ethers";
import { FlightPool__factory } from "../../../../contracts/flight";
import { LOGGER } from "../../../../utils/logger_backend";
import { getAvailableCapacity } from "../../../../utils/riskpool";
import { POOL_CONTRACT_ADDRESS } from "../../_utils/api_constants";
import { checkSignerBalance, getStatisticsProviderSigner } from "../../_utils/chain";

export async function GET() {
    if (process.env.RPC_NODE_URL === undefined || process.env.STATISTICS_PROVIDER_MNEMONIC === undefined || process.env.STATUS_PROVIDER_MNEMONIC === undefined) {
        return Response.json({
            error: "missing configuration"
        }, { status: 500 });
    }
    
    // check min amounts for application and oracle signers
    const statisticsProviderSigner = await getStatisticsProviderSigner();
    
    const minBalanceApplication = parseUnits(process.env.STATISTICS_PROVIDER_MIN_BALANCE! || "1", "wei");
    const applicationSignerHasBalance = await checkSignerBalance(statisticsProviderSigner, minBalanceApplication);

    const minAvailableCapacity = parseUnits(process.env.RISKPOOL_MIN_CAPACITY! || "100000000", "wei");
    
    const flightPool = FlightPool__factory.connect(POOL_CONTRACT_ADDRESS, statisticsProviderSigner);

    const availableCapacity = await getAvailableCapacity(flightPool, statisticsProviderSigner);

    LOGGER.debug(`available capacity: `
        + `${formatUnits(availableCapacity, parseInt(process.env.NEXT_PUBLIC_ERC20_TOKEN_DECIMALS || "6"))}`);

    const poolHasCapacity = availableCapacity >= minAvailableCapacity;

    const isReady = applicationSignerHasBalance && poolHasCapacity;

    return Response.json({}, { status: isReady ? 200 : 503 });
}
