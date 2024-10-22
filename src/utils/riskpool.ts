import { Signer } from "ethers";
import { FlightPool } from "../contracts/flight";
import { IInstance__factory, InstanceReader__factory } from "../contracts/gif";

export async function getAvailableCapacity(flightPool: FlightPool, signer: Signer): Promise<bigint> {
    // LOGGER.debug(`flight pool address: ${POOL_CONTRACT_ADDRESS}`);
    const poolNftId = await flightPool.getNftId();
    // LOGGER.debug(`pool nft id: ${poolNftId}`);

    const instanceAddress = await flightPool.getInstance();
    const instance = IInstance__factory.connect(instanceAddress, signer);
    const instanceReaderAddress = await instance.getInstanceReader();
    // LOGGER.debug(`instance reader address: ${instanceReaderAddress}`);
    const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, signer);

    const bundleNftId = await instanceReader.getBundleNftId(poolNftId, 0);

    const balanceAmount = await instanceReader.getBalanceAmount(bundleNftId);
    const lockedAmount = await instanceReader.getLockedAmount(bundleNftId);
    const feeAmount = await instanceReader.getFeeAmount(bundleNftId);

    return balanceAmount - lockedAmount - feeAmount;
}