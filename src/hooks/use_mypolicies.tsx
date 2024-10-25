import { useEnvContext } from "next-runtime-env";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addOrUpdatePolicy, resetPolicies, setLoading, setPayoutAmount } from "../redux/slices/policies";
import { FlightPlan } from "../types/flight_plan";
import { PolicyData } from "../types/policy_data";
import { ensureError } from "../utils/error";
import { logErrorOnBackend } from "../utils/logger";
import { useERC721Contract } from "./onchain/use_erc721_contract";
import { useFlightDelayProductContract } from "./onchain/use_flightdelay_product";
import { FlightPolicyData, useFlightNftContract } from "./onchain/use_flightnft_contract";
import { useInstanceReaderContract } from "./onchain/use_instance_reader";
import { useRegistryContract } from "./onchain/use_registry_contract";
import { toUtf8String } from "ethers";
import { adjustToUtc } from "../utils/time";

const NFT_ID_TYPE_POLICY = BigInt(21);

export function useMyPolicies() {
    const [ error, setError ] = useState<Error | undefined>(undefined);
    const { NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS, NEXT_PUBLIC_FLIGHT_NFT_CONTRACT_ADDRESS } = useEnvContext();
    // const router = useRouter();

    const dispatch = useDispatch();
    const { getNftIds } = useERC721Contract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getObjectInfos } = useRegistryContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getNftId } = useFlightDelayProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getPayoutAmount } = useInstanceReaderContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getFlightPolicyData } = useFlightNftContract(NEXT_PUBLIC_FLIGHT_NFT_CONTRACT_ADDRESS!);

    async function fetchPolicies() {
        dispatch(resetPolicies());
        dispatch(setLoading(true));

        try {
            console.log("fetching policies");

            // 1. get all policy nft ids for the address and check they are valid and belong to the product
            const productNftId = await getNftId();
            console.log("found product nft id", productNftId);
            let policyNftIds = await getNftIds();
            let objectInfos = await getObjectInfos(policyNftIds);
            // only keep nft ids that are policies and belong to the product
            objectInfos = objectInfos.filter(info => info.parentNftId === productNftId && info.objectType === NFT_ID_TYPE_POLICY);
            // only keep the nft id where there was a match for the objectinfo (i.e. it is a valid policy and same product)
            policyNftIds = policyNftIds.filter((_, i) => objectInfos.find(info => info.nftId === policyNftIds[i]) !== undefined);

            // console.log("found policy object infos", objectInfos);

            // 2. fetch policy data for each nft id
            const policyInfos = await getFlightPolicyData(policyNftIds, (nftId, data) => 
                dispatch(addOrUpdatePolicy(extractPolicyData(nftId, data))));
            console.log("found policy infos", policyInfos);

            // 3. fetch claim/payout data for policy nft id
            policyNftIds.forEach(async policyNftId => {
                if (policyNftIds.length > 5) { // when too many, sleep a bit to avoid rate limiting on the rpc node
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                const payoutAmount = await getPayoutAmount(policyNftId);
                if (payoutAmount !== null && payoutAmount > BigInt(0)) {
                    dispatch(setPayoutAmount({ policyNftId: policyNftId.toString(), payoutAmount: payoutAmount.toString() }));
                }
            });

            
        } catch(err) {
            handleError(err);
        } finally {
            dispatch(setLoading(false));
        }
    }

    function extractPolicyData(nftId: bigint, data: FlightPolicyData): PolicyData {
        const flightPlanTokens = data.flightData.split(" ");

        // this is a workaround for issue #142 to handle the case when the data is stored as bytes32 and as string
        const departureTimeLocal = data.departureTimeLocal.startsWith("0x") ? toUtf8String(data.departureTimeLocal) : data.departureTimeLocal;
        const arrivalTimeLocal = data.arrivalTimeLocal.startsWith("0x") ? toUtf8String(data.arrivalTimeLocal) : data.arrivalTimeLocal;
        const status = data.status === "0x00" ? "S" : toUtf8String(data.status);

        return {
            nftId: nftId.toString(),
            riskId: data.riskId,
            payoutAmount: "0",
            carrier: flightPlanTokens[0],
            flightNumber: flightPlanTokens[1],
            departureDate: flightPlanTokens[4],
            flightPlan: {
                status: status,
                departureAirportFsCode: flightPlanTokens[2],
                arrivalAirportFsCode: flightPlanTokens[3],
                departureTimeUtc: adjustToUtc(departureTimeLocal.split(" ")[0], departureTimeLocal.split(" ")[1]).unix(),
                departureTimeLocal: departureTimeLocal.split(" ")[0],
                departureTimeLocalTimezone: departureTimeLocal.split(" ")[1],
                arrivalTimeUtc: adjustToUtc(arrivalTimeLocal.split(" ")[0], arrivalTimeLocal.split(" ")[1]).unix(),
                arrivalTimeLocal: arrivalTimeLocal.split(" ")[0],
                arrivalTimeLocalTimezone: arrivalTimeLocal.split(" ")[1],
                delay: parseInt(data.delayMinutes.toString()),
            } as FlightPlan,
        } as PolicyData;
    }

    function handleError(err: unknown) {
        const error = ensureError(err);
        logErrorOnBackend(error.message, error, "createNewApplication");
        setError(error); 
    }

    return {
        error,
        fetchPolicies,
    }
}