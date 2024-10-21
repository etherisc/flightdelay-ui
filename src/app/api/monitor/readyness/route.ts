import { parseUnits } from "ethers";
import { checkSignerBalance, getApplicationSenderSigner, getOracleSigner } from "../../_utils/chain";

export async function GET() {
    if (process.env.RPC_NODE_URL === undefined || process.env.STATISTICS_PROVIDER_MNEMONIC === undefined || process.env.STATUS_PROVIDER_MNEMONIC === undefined) {
        return Response.json({
            error: "missing configuration"
        }, { status: 500 });
    }
    
    // check min amounts for application and oracle signers
    const applicationSigner = await getApplicationSenderSigner();
    const oracleSigner = await getOracleSigner();
    
    const minBalanceApplication = parseUnits(process.env.STATISTICS_PROVIDER_MIN_BALANCE! || "1", "wei");
    const minBalanceOracle = parseUnits(process.env.STATUS_PROVIDER_MIN_BALANCE! || "1", "wei");

    const applicationSignerHasBalance = await checkSignerBalance(applicationSigner, minBalanceApplication);
    const oracleSignerHasBalance = await checkSignerBalance(oracleSigner, minBalanceOracle);

    const isReady = applicationSignerHasBalance && oracleSignerHasBalance;

    return Response.json({
        applicationSignerHasBalance,
        oracleSignerHasBalance  
    }, { status: isReady ? 200 : 500 });
}
