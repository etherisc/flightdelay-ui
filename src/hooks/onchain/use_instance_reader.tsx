import { BytesLike } from "ethers";
import { FlightProduct__factory } from "../../contracts/flight";
import { IInstance__factory, InstanceReader__factory } from "../../contracts/gif";
import { IPolicy, IRisk } from "../../contracts/gif/instance/InstanceReader";
import { useWallet } from "./use_wallet";

export function useInstanceReaderContract(productContractAddress: string) {
    
    const { getSigner } = useWallet();

    async function getPolicyInfos(policyNftIs: bigint[], policyInfoRetrieved: (policyNftId: bigint, info: IPolicy.PolicyInfoStruct) => void): Promise<IPolicy.PolicyInfoStruct[]> {
        const product = FlightProduct__factory.connect(productContractAddress, await getSigner());
        const instanceAddress = await product.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, await getSigner());
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, await getSigner());
        return await Promise.all(policyNftIs.map(async (policyNftId) => {
            const pi = await instanceReader.getPolicyInfo(policyNftId);
            policyInfoRetrieved(policyNftId, pi);
            return pi;
        }));
    }

    async function getRiskInfos(riskIds: BytesLike[], riskInfoRetrieved: (riskId: BytesLike, info: IRisk.RiskInfoStruct) => Promise<void>): Promise<IRisk.RiskInfoStruct[]> {
        const product = FlightProduct__factory.connect(productContractAddress, await getSigner());
        const instanceAddress = await product.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, await getSigner());
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, await getSigner());
        return await Promise.all(riskIds.map(async (riskId) => {
            const ri = await instanceReader.getRiskInfo(riskId);
            await riskInfoRetrieved(riskId, ri);
            return ri;
        }));
    }

    return {
        getPolicyInfos,
        getRiskInfos,
    }

}