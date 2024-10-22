import { formatUnits, parseUnits } from "ethers";
import { FlightPool__factory } from "../../../../contracts/flight";
import { IInstance__factory, InstanceReader__factory } from "../../../../contracts/gif";
import { LOGGER } from "../../../../utils/logger_backend";
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
    // LOGGER.debug(`flight pool address: ${POOL_CONTRACT_ADDRESS}`);
    const poolNftId = await flightPool.getNftId();
    // LOGGER.debug(`pool nft id: ${poolNftId}`);

    const instanceAddress = await flightPool.getInstance();
    const instance = IInstance__factory.connect(instanceAddress, statisticsProviderSigner);
    const instanceReaderAddress = await instance.getInstanceReader();
    // LOGGER.debug(`instance reader address: ${instanceReaderAddress}`);
    const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, statisticsProviderSigner);

    const bundleNftId = await instanceReader.getBundleNftId(poolNftId, 0);

    const balanceAmount = await instanceReader.getBalanceAmount(bundleNftId);
    const lockedAmount = await instanceReader.getLockedAmount(bundleNftId);
    const feeAmount = await instanceReader.getFeeAmount(bundleNftId);

    const availableCapacity = balanceAmount - lockedAmount - feeAmount;
    LOGGER.debug(`available capacity: `
        + `${formatUnits(availableCapacity, parseInt(process.env.NEXT_PUBLIC_ERC20_TOKEN_DECIMALS || "6"))} `
        + `[${availableCapacity} = ${balanceAmount} - ${lockedAmount} - ${feeAmount}]`);
    
    const poolHasCapacity = availableCapacity >= minAvailableCapacity;

    const isReady = applicationSignerHasBalance && poolHasCapacity;

    return Response.json({}, { status: isReady ? 200 : 503 });
}
