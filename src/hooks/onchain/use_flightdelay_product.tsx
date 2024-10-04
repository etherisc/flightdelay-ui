import { Signer } from "ethers";
import { FlightProduct__factory } from "../../contracts/flight";
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

    // async function getPolicyInfos(): Promise<IPol[]> {

    return {
        getProductTokenHandlerAddress,
        getNftId,
    }

}