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
    const applicationSigner = await getStatisticsProviderSigner();
    const oracleSigner = await getStatusProviderSigner();
    
    const minBalanceApplication = parseUnits(process.env.STATISTICS_PROVIDER_MIN_BALANCE! || "1", "wei");
    const minBalanceOracle = parseUnits(process.env.STATUS_PROVIDER_MIN_BALANCE! || "1", "wei");

    const applicationSignerHasBalance = await checkSignerBalance(applicationSigner, minBalanceApplication);
    const oracleSignerHasBalance = await checkSignerBalance(oracleSigner, minBalanceOracle);

    const expectedPayoutCheckEnd = dayjs.utc().add(RISKPOOL_MAX_PAYOUT_CHECK_LOOKAHEAD_SECONDS, 's');
    
    const { riskpoolHasBalance, riskpoolWalletBalance, maxExpectedPayout, flightPlans } = await checkRiskpoolBalance(logReqId, oracleSigner, expectedPayoutCheckEnd.unix());

    const isReady = applicationSignerHasBalance && oracleSignerHasBalance && riskpoolHasBalance;

    return Response.json({
        applicationSignerHasBalance,
        oracleSignerHasBalance,
        maxExpectedPayoutCheck: {
            riskpoolHasBalance,
            riskpoolWalletBalance: `${formatUnits(riskpoolWalletBalance, TOKEN_DECIMALS)} (${riskpoolWalletBalance})`,
            maxExpectedPayout: `${formatUnits(maxExpectedPayout, TOKEN_DECIMALS)} (${maxExpectedPayout})`,
            maxExpectedPayoutUntil: expectedPayoutCheckEnd.toISOString(),
            flightPlans,
        }
        
    }, { status: isReady ? 200 : 500 });
}

async function checkRiskpoolBalance(logReqId: string, signer: Signer, expectedPayoutCheckEnd: number): Promise<{
    riskpoolHasBalance: boolean,
    riskpoolWalletBalance: bigint,
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
    for (const requestId of requestIds) {
        const requestState = await flightOracle.getRequestState(requestId);

        if (getNumber(requestState.requestState) !== REQUEST_STATE_ACTIVE) {
            continue;
        }

        try {
            const response = await processOracleRequest(
                logReqId, 
                flightProduct, 
                flightOracle, 
                instanceReader, 
                requestId, 
                async (logReqId: string, flightRisk: FlightProduct.FlightRiskStruct) => {
                    const arrivalTimeUtc = flightRisk.arrivalTime;
                    const isInSlot = getNumber(arrivalTimeUtc) < expectedPayoutCheckEnd;
                    LOGGER.debug(`[${logReqId}] ${isInSlot} - arrival time: ${dayjs.unix(getNumber(arrivalTimeUtc)).format()} (${arrivalTimeUtc}) | risk window end: ${dayjs.unix(getNumber(expectedPayoutCheckEnd)).format()} (${expectedPayoutCheckEnd})`);
                    return isInSlot;
                });
            
            if (response === null) {
                continue;
            }

            const maxPayout = response.flightRisk.sumOfSumInsuredAmounts;
            LOGGER.info(`[${logReqId}] max payout for ${response.flightPlan}: ${formatUnits(maxPayout, TOKEN_DECIMALS)}`);
            maxExpectedPayout += BigInt(maxPayout);
            flightPlans.push(`${response.flightPlan} / ${formatUnits(maxPayout, TOKEN_DECIMALS)}`);
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

    const riskpoolWalletBalance = await token.balanceOf(await flightRiskpool.getWallet());
    LOGGER.info(`[${logReqId}] riskpool wallet balance: ${formatUnits(riskpoolWalletBalance, TOKEN_DECIMALS)} | max expected payout: ${formatUnits(maxExpectedPayout, TOKEN_DECIMALS)} | payoutPossible: ${riskpoolWalletBalance >= maxExpectedPayout}`);

    return {
        riskpoolHasBalance: riskpoolWalletBalance >= maxExpectedPayout,
        riskpoolWalletBalance,
        maxExpectedPayout,
        flightPlans
    };
}
