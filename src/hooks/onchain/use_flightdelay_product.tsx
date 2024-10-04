import { BytesLike, Signer } from "ethers";
import { FlightProduct__factory } from "../../contracts/flight";
import { IInstance__factory, InstanceReader__factory } from "../../contracts/gif";
import { IPolicy, IRisk } from "../../contracts/gif/instance/InstanceReader";
import { useWallet } from "./use_wallet";

export function useFlightDelayProductContract(productContractAddress: string) {
    
    const { getSigner } = useWallet();

    async function getProductTokenHandlerAddress(signer: Signer): Promise<string> {
        const productContract = FlightProduct__factory.connect(productContractAddress, signer);
        return await productContract.getTokenHandler();
    }

    async function getNftId(): Promise<bigint> {
        const productContract = FlightProduct__factory.connect(productContractAddress, await getSigner());
        return await productContract.getNftId();
    }

    async function getPolicyInfos(policyNftIs: bigint[]): Promise<IPolicy.PolicyInfoStruct[]> {
        const product = FlightProduct__factory.connect(productContractAddress, await getSigner());
        const instanceAddress = await product.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, await getSigner());
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, await getSigner());
        return await Promise.all(policyNftIs.map(async (policyNftId) => {
            return await instanceReader.getPolicyInfo(policyNftId);
        }));
    }

    async function getRiskInfos(riskIds: BytesLike[]): Promise<IRisk.RiskInfoStruct[]> {
        const product = FlightProduct__factory.connect(productContractAddress, await getSigner());
        const instanceAddress = await product.getInstance();
        const instance = IInstance__factory.connect(instanceAddress, await getSigner());
        const instanceReaderAddress = await instance.getInstanceReader();
        const instanceReader = InstanceReader__factory.connect(instanceReaderAddress, await getSigner());
        return await Promise.all(riskIds.map(async (riskId) => {
            return await instanceReader.getRiskInfo(riskId);
        }));
    }

    return {
        getProductTokenHandlerAddress,
        getNftId,
        getPolicyInfos,
        getRiskInfos,
    }

}