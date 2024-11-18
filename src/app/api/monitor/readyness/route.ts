import { formatUnits, parseUnits, Signer } from "ethers";
import { nanoid } from "nanoid";
import { FlightPool__factory } from "../../../../contracts/flight";
import { LOGGER } from "../../../../utils/logger_backend";
import { getAvailableCapacity } from "../../../../utils/riskpool";
import { POOL_CONTRACT_ADDRESS, TOKEN_DECIMALS } from "../../_utils/api_constants";
import { checkSignerBalance, getStatisticsProviderSigner, getStatusProviderSigner } from "../../_utils/chain";

export async function GET() {
    const logReqId = nanoid();
    LOGGER.info(`[${logReqId}] Readyness check`);
    if (process.env.RPC_NODE_URL === undefined || process.env.STATISTICS_PROVIDER_MNEMONIC === undefined || process.env.STATUS_PROVIDER_MNEMONIC === undefined) {
        return Response.json({
            error: "missing configuration"
        }, { status: 500 });
    }
    
    // check min amounts for application and oracle signers
    const statisticsProviderSigner = await getStatisticsProviderSigner();
    const statusProviderSigner = await getStatusProviderSigner();
    
    const minBalanceStatisticsProvider = parseUnits(process.env.STATISTICS_PROVIDER_MIN_BALANCE! || "1", "wei");
    const minBalanceStatusProvider = parseUnits(process.env.STATUS_PROVIDER_MIN_BALANCE! || "1", "wei");
    const minAvailableCapacity = parseUnits(process.env.RISKPOOL_MIN_CAPACITY! || "100000000", "wei");
    
    const statisticsProviderSignerHasBalance = await checkSignerBalance(statisticsProviderSigner, minBalanceStatisticsProvider);
    const statusProviderSignerHasBalance = await checkSignerBalance(statusProviderSigner, minBalanceStatusProvider);

    
    const { riskpoolAvailableCapacity, riskpoolHasCapacity } = await checkRiskpoolCapacity(statisticsProviderSigner, minAvailableCapacity);
    
    const isReady = statisticsProviderSignerHasBalance && statusProviderSignerHasBalance && riskpoolHasCapacity;

    return Response.json({
        statisticsProviderSignerHasBalance,
        statusProviderSignerHasBalance,
        riskpoolHasCapacity,
        riskpoolAvailableCapacity: `${formatUnits(riskpoolAvailableCapacity, TOKEN_DECIMALS)} (${riskpoolAvailableCapacity})`,
        
    }, { status: isReady ? 200 : 500 });
}

async function checkRiskpoolCapacity(
    signer: Signer, minAvailableCapacity: bigint
): Promise<{ riskpoolAvailableCapacity: bigint, riskpoolHasCapacity: boolean }> {
    const flightPool = FlightPool__factory.connect(POOL_CONTRACT_ADDRESS, signer);
    const riskpoolAvailableCapacity = await getAvailableCapacity(flightPool, signer);
    const riskpoolHasCapacity = riskpoolAvailableCapacity >= minAvailableCapacity;

    return {
        riskpoolAvailableCapacity,
        riskpoolHasCapacity
    };
}
