import { FlightProduct__factory } from "../../contracts/flight";
import { ChainNft__factory, IRegistry, IRegistry__factory } from "../../contracts/gif";
import { useWallet } from "./use_wallet";

export function useERC721Contract(productAddress: string) {
    const { getSigner } = useWallet();

    async function getNftIds(): Promise<bigint[]> {
        const registry = await getRegistry();
        const signer = await getSigner();

        if (signer === undefined) {
            console.log("getNftIds - signer is undefined");
            return [];
        }

        const chainNftAddress = await registry.getChainNftAddress();
        console.log("getNftIds - chainNftAddress", chainNftAddress);
        const chainNft = ChainNft__factory.connect(chainNftAddress, await getSigner());
        
        const owner = await signer.getAddress();
        const numTokens = await chainNft.balanceOf(owner);
        console.log("getNftIds - nftAddress, owner, numTokens", chainNftAddress, owner, numTokens.toString());

        const tokensIds = [];
        for (let i = 0; i < numTokens; i++) {
            if (numTokens > 5) {
                // sleep random <100ms
                await new Promise(resolve => setTimeout(resolve, 25));
            }
            tokensIds.push(await chainNft.tokenOfOwnerByIndex(owner, i));
        }
        return tokensIds;
    }

    async function getRegistry(): Promise<IRegistry> {
        const signer = await getSigner();
        const product = FlightProduct__factory.connect(productAddress, signer);
        const registryAddress = await product.getRegistry();
        console.log("getRegistryAddress", registryAddress);
        return IRegistry__factory.connect(registryAddress, signer);
    }

    return {
        getNftIds,
    }
}
