import { formatUnits, parseUnits, Signer } from "ethers";
import { nanoid } from "nanoid";
import { FlightPool__factory } from "../../../../contracts/flight";
import { LOGGER } from "../../../../utils/logger_backend";
import { getAvailableCapacity } from "../../../../utils/riskpool";
import { POOL_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, TOKEN_DECIMALS } from "../../_utils/api_constants";
import { checkSignerBalance, getStatisticsProviderSigner, getStatusProviderSigner } from "../../_utils/chain";
import { IERC20__factory } from "../../../../contracts/openzeppelin-contracts";

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
    const minBalance = parseUnits(process.env.RISKPOOL_MIN_BALANCE! || "200000000", "wei");
    
    const statisticsProviderSignerHasBalance = await checkSignerBalance(statisticsProviderSigner, minBalanceStatisticsProvider);
    const statusProviderSignerHasBalance = await checkSignerBalance(statusProviderSigner, minBalanceStatusProvider);

    
    const { riskpoolAvailableCapacity, riskpoolHasCapacity } = await checkRiskpoolCapacity(statisticsProviderSigner, minAvailableCapacity);
    const { riskpoolWalletBalanceSufficient, riskpoolWalletAllowanceSufficient, riskpoolWalletBalance, riskpoolWalletAllowance } = await checkRiskpoolBalance(logReqId, statisticsProviderSigner, minBalance);
    
    const isReady = statisticsProviderSignerHasBalance && statusProviderSignerHasBalance && riskpoolHasCapacity && riskpoolWalletBalanceSufficient && riskpoolWalletAllowanceSufficient;

    return Response.json({
        statisticsProviderSignerHasBalance,
        statusProviderSignerHasBalance,
        riskpoolHasCapacity,
        riskpoolWalletBalanceSufficient,
        riskpoolWalletAllowanceSufficient,
        riskpoolAvailableCapacity: `${formatUnits(riskpoolAvailableCapacity, TOKEN_DECIMALS)} (${riskpoolAvailableCapacity})`,
        riskpoolWalletBalance: `${formatUnits(riskpoolWalletBalance, TOKEN_DECIMALS)} (${riskpoolWalletBalance})`,
        riskpoolWalletAllowance: `${formatUnits(riskpoolWalletAllowance, TOKEN_DECIMALS)} (${riskpoolWalletAllowance})`,
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

async function checkRiskpoolBalance(logReqId: string, signer: Signer, minBalance: bigint): Promise<{
    riskpoolWalletBalanceSufficient: boolean,
    riskpoolWalletBalance: bigint,
    riskpoolWalletAllowanceSufficient: boolean,
    riskpoolWalletAllowance: bigint,
}> {

    const flightRiskpool = FlightPool__factory.connect(POOL_CONTRACT_ADDRESS, signer);
    const token = IERC20__factory.connect(TOKEN_CONTRACT_ADDRESS, signer);

    const riskpoolWalletBalance = await token.balanceOf(await flightRiskpool.getWallet());
    const riskpoolWalletBalanceSufficient = riskpoolWalletBalance >= minBalance;
    const tokenHandler = await flightRiskpool.getTokenHandler();
    const riskpoolWalletAllowance = await token.allowance(await flightRiskpool.getWallet(), tokenHandler);
    const riskpoolWalletAllowanceSufficient = riskpoolWalletAllowance >= minBalance;
    LOGGER.info(`[${logReqId}] riskpool wallet balance: ${formatUnits(riskpoolWalletBalance, TOKEN_DECIMALS)} | min balance: ${formatUnits(minBalance, TOKEN_DECIMALS)} | payoutPossible: ${riskpoolWalletBalance >= minBalance}`);
    LOGGER.info(`[${logReqId}] riskpool wallet allowance: ${formatUnits(riskpoolWalletAllowance, TOKEN_DECIMALS)} | max expected payout: ${formatUnits(minBalance, TOKEN_DECIMALS)} | payoutPossible: ${riskpoolWalletAllowance >= minBalance}`);

    return {
        riskpoolWalletBalanceSufficient,
        riskpoolWalletAllowanceSufficient,
        riskpoolWalletBalance,
        riskpoolWalletAllowance,
    };
}