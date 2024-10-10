import { BytesLike, decodeBytes32String, getNumber, hexlify, toUtf8String } from "ethers";
import { useEnvContext } from "next-runtime-env";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { IRisk } from "../contracts/gif/instance/InstanceReader";
import { addOrUpdatePolicy, addOrUpdateRisk, resetPolicies, setLoading } from "../redux/slices/policies";
import { RiskData } from "../types/risk_data";
import { ensureError } from "../utils/error";
import { logErrorOnBackend } from "../utils/logger";
import { useERC721Contract } from "./onchain/use_erc721_contract";
import { useFlightDelayProductContract } from "./onchain/use_flightdelay_product";
import { useInstanceReaderContract } from "./onchain/use_instance_reader";
import { useRegistryContract } from "./onchain/use_registry_contract";

const NFT_ID_TYPE_POLICY = BigInt(21);

export function useMyPolicies() {
    const [ error, setError ] = useState<Error | undefined>(undefined);
    const { NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS } = useEnvContext();
    // const router = useRouter();

    const dispatch = useDispatch();
    const { getNftIds } = useERC721Contract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getObjectInfos } = useRegistryContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getNftId, decodeRiskData } = useFlightDelayProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getPolicyInfos, getRiskInfos } = useInstanceReaderContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);

    async function fetchPolicies() {
        dispatch(resetPolicies());
        dispatch(setLoading(true));

        try {
            console.log("fetching policies");

            // 1. get all policy nft ids for the address and check they are valid and belong to the product
            const productNftId = await getNftId();
            console.log("found product nft id", productNftId);
            let nftIds = await getNftIds();
            let objectInfos = await getObjectInfos(nftIds);
            // only keep nft ids that are policies and belong to the product
            objectInfos = objectInfos.filter(info => info.parentNftId === productNftId && info.objectType === NFT_ID_TYPE_POLICY);
            // only keep the nft id where there was a match for the objectinfo (i.e. it is a valid policy and same product)
            nftIds = nftIds.filter((_, i) => objectInfos.find(info => info.nftId === nftIds[i]) !== undefined);

            console.log("found policy object infos", objectInfos);

            // 2. fetch policy data for each nft id
            const policyInfos = await getPolicyInfos(nftIds, (nftId, info) => 
                dispatch(addOrUpdatePolicy({
                    nftId: nftId.toString(),
                    riskId: hexlify(info.riskId),
                })));
            console.log("found policy infos", policyInfos);

            // TODO: 3. fetch flight data from the risk the policy is covering
            const riskIDs = policyInfos.map(info => info.riskId).filter((item, i, ar) => ar.indexOf(item) === i);
            console.log("found risk ids", riskIDs);
            const riskInfos = await getRiskInfos(riskIDs, async (riskId, info) => {
                dispatch(addOrUpdateRisk(await convertRiskData(riskId, info)));
            });
            console.log("found risk infos", riskInfos);

            // TODO: 4. fetch claim/payout data for policy nft id
            
        } catch(err) {
            handleError(err);
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function convertRiskData(riskId: BytesLike, info: IRisk.RiskInfoStruct): Promise<RiskData> {
        const flightRiskData = await decodeRiskData(info.data);
        const flightDataTokens = decodeBytes32String(flightRiskData.flightData).split(" ");
        const departureTimeLocal = toUtf8String(flightRiskData.departureTimeLocal);
        const arrivalTimeLocal = toUtf8String(flightRiskData.arrivalTimeLocal);
        return {
            riskId: hexlify(riskId),
            carrier: flightDataTokens[0],
            flightNumber: flightDataTokens[1],
            departureDate: flightDataTokens[4],
            flightPlan: {
                status: toUtf8String(flightRiskData.status),
                departureAirportFsCode: flightDataTokens[2],
                arrivalAirportFsCode: flightDataTokens[3],
                departureTimeUtc: getNumber(flightRiskData.departureTime),
                departureTimeLocal: departureTimeLocal.split(" ")[0],
                departureTimeLocalTimezone: departureTimeLocal.split(" ")[1],
                arrivalTimeUtc: getNumber(flightRiskData.arrivalTime),
                arrivalTimeLocal: arrivalTimeLocal.split(" ")[0],
                arrivalTimeLocalTimezone: arrivalTimeLocal.split(" ")[1],
                delay: getNumber(flightRiskData.delayMinutes), 
            }
        };
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