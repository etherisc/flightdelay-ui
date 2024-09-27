import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetPolicies } from "../redux/slices/policies";
import { ensureError } from "../utils/error";
import { logErrorOnBackend } from "../utils/logger";

export function useMyPolicies(address: string) {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<Error | undefined>(undefined);
    // const router = useRouter();

    const dispatch = useDispatch();

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
            console.log("fetching policies for address", address);

            // TODO: 1. get all policy nft ids for the address and check they are valid and belong to the product
            // TODO: 2. fetch policy data for each nft id
            // TODO: 3. fetch flight data from the risk the policy is covering
            // TODO: 4. fetch claim/payout data for policy nft id
            
            // const signer = await getSigner();
            // const nftIds = await getNftIds(address, signer);
            // await fetchPolicyData(
            //     nftIds, 
            //     signer,
            //     async (policy: PolicyData) => { 
            //         try {
            //             const cityData = await getCity(policy.locationId);
            //             policy.locationName = cityData.name.local;
            //             dispatch(addOrUpdatePolicy(policy)); 
            //         } catch (err) {
            //             handleError(err);
            //         }
            //     });
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

    async function fetchPolicy(/*nftId: bigint*/) {
        setLoading(true);
        try {
            console.log("fetching policies for address", address);
            // const signer = await getSigner();
            // await fetchPolicyData(
            //     [nftId], 
            //     signer,
            //     async (policy: PolicyData) => { 
            //         try {
            //             const cityData = await getCity(policy.locationId);
            //             policy.locationName = cityData.name.local;
            //             dispatch(addOrUpdatePolicy(policy)); 
            //         } catch (err) {
            //             handleError(err);
            //         }
            //     });
        } catch(err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    return {
        loading,
        error,
        fetchPolicies,
        fetchPolicy,
    }
}