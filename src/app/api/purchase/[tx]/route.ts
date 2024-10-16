import { Signer } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { FlightOracle__factory, FlightProduct__factory, FlightUSD__factory } from "../../../../contracts/flight";
import { IApplicationService__factory, IBundleService__factory, IPolicyService__factory, IPoolService__factory } from "../../../../contracts/gif";
import { TransactionFailedException } from "../../../../types/errors";
import { getFieldFromLogs } from "../../../../utils/chain";
import { getBackendVoidSigner } from "../../_utils/chain";
import { LOGGER } from "../../../../utils/logger_backend";

// @ts-expect-error BigInt is not defined in the global scope
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

/**
 * check if a purchase request is pending or finished
 */
export async function GET(request: NextRequest, { params } : { params: { tx: string } }) {
    const reqId = nanoid();
    const txHash = params.tx;
    const signer = await getBackendVoidSigner();

    // fetch rating data from flightstats
    const { policyNftId, riskId } = await checkPolicyCreated(reqId, txHash, signer);

    if (policyNftId === BigInt(0)) {
        return Response.json({ error: 'Policy not created yet' }, { status: 202 });
    }

    return Response.json({
        policyNftId, riskId
    }, { status: 200 });
}

async function checkPolicyCreated(
    reqId: string,
    txHash: string,
    signer: Signer
): Promise<{ policyNftId: bigint, riskId: string }> {
    try {
        LOGGER.debug(`[${reqId}] checking policy created for tx: ${txHash}`);
        const tx = await signer.provider!.getTransaction(txHash);
        // const tx = await getTransactionWithRetry(reqId, signer, txHash);
        LOGGER.debug(`[${reqId}] tx found: ${tx !== null}`);
    
        if (tx === null) {
            LOGGER.warn(`[${reqId}] unknown tx: ${txHash}`);
            // throw new Error(`transaction not found: ${tx}`);
            return { policyNftId: BigInt(0), riskId: "" };
        }
    
        if (! tx.isMined || tx.blockNumber === null || await tx.confirmations() < 1) {
            LOGGER.debug(`[${reqId}] tx is not mined and confirmed yet`);
            return { policyNftId: BigInt(0), riskId: "" };
        }

        // LOGGER.debug(`[${reqId}] tx is mined`);
        const txRcpt = await tx.wait();
        // LOGGER.debug(`[${reqId}] tx receipt found: ${txRcpt !== null}`);
    
        if (txRcpt === null) {
            throw new TransactionFailedException(null, null);
        }
    
        if (txRcpt.status !== 1) {
            throw new TransactionFailedException(txRcpt, null);
        }

        const logs = txRcpt.logs;
        const policyNftId = getFieldFromLogs(logs, IPolicyService__factory.createInterface(), "LogPolicyServicePolicyCreated", "policyNftId") as bigint;
        const riskId = getFieldFromLogs(logs, IApplicationService__factory.createInterface(), "LogApplicationServiceApplicationCreated", "riskId") as string;
        LOGGER.info(`policy created - policyNftId: ${policyNftId} riskId: ${riskId} tx: ${tx.hash}`);
        return { policyNftId, riskId };
    } catch (err) {
        const errorDecoder = ErrorDecoder.create([
            FlightProduct__factory.createInterface(), 
            FlightUSD__factory.createInterface(),
            FlightOracle__factory.createInterface(),
            IPolicyService__factory.createInterface(),
            IPoolService__factory.createInterface(),
            IBundleService__factory.createInterface()
        ]);
        const decodedError = await errorDecoder.decode(err);
        LOGGER.error(`Decoded error reason: ${decodedError.reason}`);
        LOGGER.error(`Decoded error args: ${decodedError.args}`);
        throw new TransactionFailedException(null, decodedError);
    }
}
