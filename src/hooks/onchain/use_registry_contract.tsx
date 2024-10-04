import { FlightProduct__factory } from "../../contracts/flight";
import { IRegistry, IRegistry__factory } from "../../contracts/gif";
import { useWallet } from "./use_wallet";

export function useRegistryContract(productAddress: string) {
    const { getSigner } = useWallet();

    async function getObjectInfos(nftIds: bigint[]): Promise<IRegistry.ObjectInfoStruct[]> {
        const registry = await getRegistry();2
        // execute above loop in parallel
        return await Promise.all(nftIds.map(async (nftId) => {
            return await registry["getObjectInfo(uint96)"](nftId);
        }));
    }

    async function getRegistry(): Promise<IRegistry> {
        const signer = await getSigner();
        const product = FlightProduct__factory.connect(productAddress, signer);
        const registryAddress = await product.getRegistry();
        console.log("getRegistryAddress", registryAddress);
        return IRegistry__factory.connect(registryAddress, signer);
    }

    return {
        getObjectInfos,
    }
}
