import { FlightNft, FlightNft__factory } from "../../contracts/flight";
import { randomSleep } from "../../utils/sleep";
import { useWallet } from "./use_wallet";

export function useFlightNftContract(flightNftAddress: string) {
    const { getSigner } = useWallet();

    async function getFlightPolicyData(nftIds: bigint[], dataFetched: (nftId: bigint, data: FlightPolicyData) => void): Promise<FlightPolicyData[]> {
        const flightNft = await getFlightNft();
        const policyData = [];
        for (const nftId of nftIds) {
            if (nftIds.length > 5) { // when too many, sleep a bit to avoid rate limiting on the rpc node
                await randomSleep(50);
            }
            
            dataFetched(nftId, await flightNft.getPolicyData(nftId));
            policyData.push(await flightNft.getPolicyData(nftId));
        }
        return policyData;
    }

    async function getFlightNft(): Promise<FlightNft> {
        const signer = await getSigner();
        return FlightNft__factory.connect(flightNftAddress, signer);
    }

    return {
        getFlightPolicyData,
    }
}

export type FlightPolicyData = {
    riskId: string,
    flightData: string,
    departureTimeLocal: string,
    arrivalTimeLocal: string,
    premiumAmount: bigint,
    payoutAmounts: bigint[],
    status: string,
    delayMinutes: bigint,
}
