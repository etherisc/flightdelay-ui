import { formatUnits, getNumber, parseUnits, Signer } from "ethers";
import { checkSignerBalance, getStatisticsProviderSigner, getStatusProviderSigner } from "../../_utils/chain";
import { FlightOracle__factory, FlightPool__factory, FlightProduct, FlightProduct__factory } from "../../../../contracts/flight";
import { ORACLE_CONTRACT_ADDRESS, POOL_CONTRACT_ADDRESS, PRODUCT_CONTRACT_ADDRESS, RISKPOOL_MAX_PAYOUT_CHECK_LOOKAHEAD_SECONDS, TOKEN_CONTRACT_ADDRESS, TOKEN_DECIMALS } from "../../_utils/api_constants";
import { IInstance__factory, InstanceReader__factory } from "../../../../contracts/gif";
import { collectActiveRequestIds, processOracleRequest } from "../../_utils/flight_oracle";
import { LOGGER } from "../../../../utils/logger_backend";
import { IERC20__factory } from "../../../../contracts/openzeppelin-contracts";
import { nanoid } from "nanoid";
import { dayjs } from "../../../../utils/date";

const REQUEST_STATE_ACTIVE = 5;

export async function GET() {
    if (process.env.RPC_NODE_URL === undefined || process.env.STATISTICS_PROVIDER_MNEMONIC === undefined || process.env.STATUS_PROVIDER_MNEMONIC === undefined) {
        return Response.json({
            error: "missing configuration"
        }, { status: 500 });
    }
    const logReqId = nanoid();
    
    // check min amounts for application and oracle signers
    const statisticsProviderSigner = await getStatisticsProviderSigner();
    const statusProviderSigner = await getStatusProviderSigner();
    
    const minBalanceStatisticsProvider = parseUnits(process.env.STATISTICS_PROVIDER_MIN_BALANCE! || "1", "wei");
    const minBalanceStatusProvider = parseUnits(process.env.STATUS_PROVIDER_MIN_BALANCE! || "1", "wei");

    const statisticsProvoderSignerHasBalance = await checkSignerBalance(statisticsProviderSigner, minBalanceStatisticsProvider);
    const statusProviderSignerHasBalance = await checkSignerBalance(statusProviderSigner, minBalanceStatusProvider);

    const expectedPayoutCheckEnd = dayjs.utc().add(RISKPOOL_MAX_PAYOUT_CHECK_LOOKAHEAD_SECONDS, 's');
    
    const { riskpoolWalletBalanceSufficient, riskpoolWalletBalance, riskpoolWalletAllowance, riskpoolWalletAllowanceSufficient, maxExpectedPayout, flightPlans } = await checkRiskpoolBalance(logReqId, statusProviderSigner, expectedPayoutCheckEnd.unix());

    const isReady = statisticsProvoderSignerHasBalance && statusProviderSignerHasBalance && riskpoolWalletBalanceSufficient && riskpoolWalletAllowanceSufficient;

    return Response.json({
        statisticsProvoderSignerHasBalance,
        statusProviderSignerHasBalance,
        maxExpectedPayoutCheck: {
            riskpoolWalletBalanceSufficient,
            riskpoolWalletAllowanceSufficient,
            riskpoolWalletBalance: `${formatUnits(riskpoolWalletBalance, TOKEN_DECIMALS)} (${riskpoolWalletBalance})`,
            riskpoolWalletAllowance: `${formatUnits(riskpoolWalletAllowance, TOKEN_DECIMALS)} (${riskpoolWalletAllowance})`,
            maxExpectedPayout: `${formatUnits(maxExpectedPayout, TOKEN_DECIMALS)} (${maxExpectedPayout})`,
            maxExpectedPayoutUntil: expectedPayoutCheckEnd.toISOString(),
            flightPlans,
        }
        
    }, { status: isReady ? 200 : 500 });
}

async function checkRiskpoolBalance(logReqId: string, signer: Signer, expectedPayoutCheckEnd: number): Promise<{
    riskpoolWalletBalanceSufficient: boolean,
    riskpoolWalletBalance: bigint,
    riskpoolWalletAllowanceSufficient: boolean,
    riskpoolWalletAllowance: bigint,
    maxExpectedPayout: bigint, 
    flightPlans: string[]
}> {

    const flightProduct = FlightProduct__factory.connect(PRODUCT_CONTRACT_ADDRESS, signer);
    const flightOracle = FlightOracle__factory.connect(ORACLE_CONTRACT_ADDRESS, signer);
    const flightRiskpool = FlightPool__factory.connect(POOL_CONTRACT_ADDRESS, signer);
    const token = IERC20__factory.connect(TOKEN_CONTRACT_ADDRESS, signer);
    const instanceAddress = await flightOracle.getInstance();
    const instance = IInstance__factory.connect(instanceAddress, signer);
    const instanceReaderAddress = await instance.getInstanceReader();
    const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, signer);
    
    let maxExpectedPayout = BigInt(0);
    const requestIds = await collectActiveRequestIds(logReqId, flightOracle);
    const flightPlans = [] as string[];

    // if status == null and request id !== null => resend request
    // let oracleResponses = [] as { requestId: bigint, status: string | null, delay: number, riskId: string | null, flightPlan: string }[];
    const responses = [];
    
    for (const requestId of requestIds) {
        const requestState = await flightOracle.getRequestState(requestId);

        if (getNumber(requestState.requestState) !== REQUEST_STATE_ACTIVE) {
            continue;
        }

        try {
            responses.push(await processOracleRequest(
                logReqId, 
                flightProduct, 
                flightOracle, 
                instanceReader, 
                requestId, 
                async (logReqId: string, flightRisk: FlightProduct.FlightRiskStruct) => {
                    const arrivalTimeUtc = flightRisk.arrivalTime;
                    const isInSlot = getNumber(arrivalTimeUtc) < expectedPayoutCheckEnd;
                    LOGGER.debug(`[${logReqId}] ${isInSlot} - arrival time: ${dayjs.unix(getNumber(arrivalTimeUtc)).format()} (${arrivalTimeUtc}) | risk window end: ${dayjs.unix(getNumber(expectedPayoutCheckEnd)).format()} (${expectedPayoutCheckEnd})`);
                    return { hasLanded: isInSlot, delay: 0, status: "S" };
                }));
        } catch (err) {
            // @ts-expect-error error handling
            LOGGER.error(`[${logReqId}] ${err.message}`);
            // @ts-expect-error error handling
            LOGGER.error(`[${logReqId}] ${err.stack}`);
        } finally {
            // sleep 100ms to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    responses.filter(r => r !== null).sort((r1, r2) => getNumber(r1.flightRisk.departureTime) - getNumber(r2.flightRisk.departureTime)).forEach(response => {
        const maxPayout = response.flightRisk.sumOfSumInsuredAmounts;
        LOGGER.info(`[${logReqId}] max payout for ${response.flightPlan}: ${formatUnits(maxPayout, TOKEN_DECIMALS)}`);
        maxExpectedPayout += BigInt(maxPayout);
        flightPlans.push(`${response.flightPlan} / ${formatUnits(maxPayout, TOKEN_DECIMALS)}`);
    });

    const riskpoolWalletBalance = await token.balanceOf(await flightRiskpool.getWallet());
    const tokenHandler = await flightRiskpool.getTokenHandler();
    const riskpoolWalletAllowance = await token.allowance(await flightRiskpool.getWallet(), tokenHandler);
    const riskpoolWalletAllowanceSufficient = riskpoolWalletAllowance >= maxExpectedPayout;
    LOGGER.info(`[${logReqId}] riskpool wallet balance: ${formatUnits(riskpoolWalletBalance, TOKEN_DECIMALS)} | max expected payout: ${formatUnits(maxExpectedPayout, TOKEN_DECIMALS)} | payoutPossible: ${riskpoolWalletBalance >= maxExpectedPayout}`);
    LOGGER.info(`[${logReqId}] riskpool wallet allowance: ${formatUnits(riskpoolWalletAllowance, TOKEN_DECIMALS)} | max expected payout: ${formatUnits(maxExpectedPayout, TOKEN_DECIMALS)} | payoutPossible: ${riskpoolWalletAllowance >= maxExpectedPayout}`);

    return {
        riskpoolWalletBalanceSufficient: riskpoolWalletBalance >= maxExpectedPayout,
        riskpoolWalletAllowanceSufficient,
        riskpoolWalletBalance,
        riskpoolWalletAllowance,
        maxExpectedPayout,
        flightPlans
    };
}
