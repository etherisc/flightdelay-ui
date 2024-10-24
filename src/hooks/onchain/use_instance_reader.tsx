import { BytesLike } from "ethers";
import { FlightProduct__factory } from "../../contracts/flight";
import { IInstance__factory, InstanceReader__factory } from "../../contracts/gif";
import { IPolicy, IRisk } from "../../contracts/gif/instance/InstanceReader";
import { useWallet } from "./use_wallet";
import { randomSleep } from "../../utils/sleep";

export function useInstanceReaderContract(productContractAddress: string) {
    
    const { getSigner } = useWallet();

    async function getPolicyInfos(policyNftIds: bigint[], policyInfoRetrieved: (policyNftId: bigint, info: IPolicy.PolicyInfoStruct) => void): Promise<IPolicy.PolicyInfoStruct[]> {
        const product = FlightProduct__factory.connect(productContractAddress, await getSigner());
        const instanceAddress = await product.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, await getSigner());
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, await getSigner());
        const policyInfos = [];
        for (const policyNftId of policyNftIds) {
            if (policyNftIds.length > 5) { // when too many, sleep a bit to avoid rate limiting on the rpc node
                await randomSleep(50); 
            }
            const pi = await instanceReader.getPolicyInfo(policyNftId);
            policyInfoRetrieved(policyNftId, pi);
            policyInfos.push(pi);
        }
        return policyInfos;
    }

    async function getRiskInfos(riskIds: BytesLike[], riskInfoRetrieved: (riskId: BytesLike, info: IRisk.RiskInfoStruct) => Promise<void>): Promise<IRisk.RiskInfoStruct[]> {
        const product = FlightProduct__factory.connect(productContractAddress, await getSigner());
        const instanceAddress = await product.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, await getSigner());
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, await getSigner());
        const riskInfos = [];
        for (const riskId of riskIds) {
            if (riskIds.length > 5) { // when too many, sleep a bit to avoid rate limiting on the rpc node
                await randomSleep(50);
            }
            const ri = await instanceReader.getRiskInfo(riskId);
            await riskInfoRetrieved(riskId, ri);
            riskInfos.push(ri);
        }
        return riskInfos;
    }

    async function getPayoutAmount(policyId: bigint): Promise<bigint | null> {
        const product = FlightProduct__factory.connect(productContractAddress, await getSigner());
        const instanceAddress = await product.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, await getSigner());
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, await getSigner());

        const policyInfo = await instanceReader.getPolicyInfo(policyId);
        if (policyInfo.productNftId === BigInt(0)) {
            return null;
        }

        // no payouts on the policy
        if (policyInfo.claimsCount === BigInt(0)) {
            return null;
        }

        return policyInfo.payoutAmount;
    }
    return {
        getPolicyInfos,
        getRiskInfos,
        getPayoutAmount,
    }

}