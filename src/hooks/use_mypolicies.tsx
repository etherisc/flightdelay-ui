import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetPolicies } from "../redux/slices/policies";
import { ensureError } from "../utils/error";
import { logErrorOnBackend } from "../utils/logger";
import { useERC721Contract } from "./onchain/use_erc721_contract";
import { useEnvContext } from "next-runtime-env";
import { useRegistryContract } from "./onchain/use_registry_contract";
import { useFlightDelayProductContract } from "./onchain/use_flightdelay_product";

const NFT_ID_TYPE_POLICY = BigInt(21);

export function useMyPolicies() {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<Error | undefined>(undefined);
    const { NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS } = useEnvContext();
    // const router = useRouter();

    const dispatch = useDispatch();
    const { getNftIds } = useERC721Contract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getObjectInfos } = useRegistryContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);
    const { getNftId } = useFlightDelayProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS!);

    // const { getSigner } = useWallet();
    // // const { NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS, NEXT_PUBLIC_NFT_CONTRACT_ADDRESS } = useEnvContext();
    // const { fetchPolicyData } = useProductContract(/*NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS*/);
    // // this address should be fetched from the registry smart contract, but its the same for the lifetime of the product
    // // so we shortcut this and move it to a configuration value
    // const { getNftIds, transferNft } = useERC721Contract(/*NEXT_PUBLIC_NFT_CONTRACT_ADDRESS*/);
    // const { getCity } = useQApiCities();

    async function fetchPolicies() {
        setLoading(true);
        dispatch(resetPolicies());
        try {
            console.log("fetching policies");

            // 1. get all policy nft ids for the address and check they are valid and belong to the product
            const productNftId = await getNftId();
            const nftIds = await getNftIds();
            let objectInfos = await getObjectInfos(nftIds);
            // only keep nft ids that are policies and belong to the product
            objectInfos = objectInfos.filter(info => info.parentNftId === productNftId && info.objectType === NFT_ID_TYPE_POLICY);

            console.log("found policy object infos", objectInfos);

            // TODO: 2. fetch policy data for each nft id
            // TODO: 3. fetch flight data from the risk the policy is covering
            // TODO: 4. fetch claim/payout data for policy nft id
            
        } catch(err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    function handleError(err: unknown) {
        const error = ensureError(err);
        logErrorOnBackend(error.message, error, "createNewApplication");
        setError(error); 
    }

    return {
        loading,
        error,
        fetchPolicies,
    }
}