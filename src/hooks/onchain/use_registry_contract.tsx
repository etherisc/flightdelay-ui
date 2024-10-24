import { FlightProduct__factory } from "../../contracts/flight";
import { IRegistry, IRegistry__factory } from "../../contracts/gif";
import { randomSleep } from "../../utils/sleep";
import { useWallet } from "./use_wallet";

export function useRegistryContract(productAddress: string) {
    const { getSigner } = useWallet();

    async function getObjectInfos(nftIds: bigint[]): Promise<IRegistry.ObjectInfoStruct[]> {
        const registry = await getRegistry();
        const objectInfos = [];
        for (const nftId of nftIds) {
            if (nftIds.length > 5) { // when too many, sleep a bit to avoid rate limiting on the rpc node
                await randomSleep(50);
            }
            objectInfos.push(await registry["getObjectInfo(uint96)"](nftId));
        }
        return objectInfos;
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
