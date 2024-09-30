import { Signer } from "ethers";
import { FlightProduct__factory } from "../../contracts/gif";

export function useFlightDelayProductContract(productContractAddress: string) {

    async function getProductTokenHandlerAddress(signer: Signer): Promise<string> {
        const productContract = FlightProduct__factory.connect(productContractAddress, signer);
        return await productContract.getTokenHandler();
    }

    return {
        getProductTokenHandlerAddress,
    }

}