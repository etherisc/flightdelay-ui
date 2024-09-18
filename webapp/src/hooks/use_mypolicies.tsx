import { useEnvContext } from "next-runtime-env";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addOrUpdatePolicy, resetPolicies } from "../redux/slices/mypolicies";
import { PolicyData } from "../types/policy_data";
import { ensureError } from "../utils/error";
import { logErrorOnBackend } from "../utils/logger";
import { PATH_MYPOLICIES } from "../utils/paths";
import { useQApiCities } from "./api/use_qapi_cities";
import { useERC721Contract } from "./onchain/use_erc721_contract";
import { useProductContract } from "./onchain/use_product_contract";
import { useWallet } from "./onchain/use_wallet";

export function useMyPolicies(address: string) {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<Error | undefined>(undefined);
    const router = useRouter();

    const dispatch = useDispatch();

    const { getSigner } = useWallet();
    const { NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS, NEXT_PUBLIC_NFT_CONTRACT_ADDRESS } = useEnvContext();
    const { fetchPolicyData } = useProductContract(NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS);
    // this address should be fetched from the registry smart contract, but its the same for the lifetime of the product
    // so we shortcut this and move it to a configuration value
    const { getNftIds, transferNft } = useERC721Contract(NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
    const { getCity } = useQApiCities();

    async function fetchPolicies() {
        setLoading(true);
        dispatch(resetPolicies());
        try {
            console.log("fetching policies for address", address);
            const signer = await getSigner();
            const nftIds = await getNftIds(address, signer);
            await fetchPolicyData(
                nftIds, 
                signer,
                async (policy: PolicyData) => { 
                    try {
                        const cityData = await getCity(policy.locationId);
                        policy.locationName = cityData.name.local;
                        dispatch(addOrUpdatePolicy(policy)); 
                    } catch (err) {
                        handleError(err);
                    }
                });
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

    async function fetchPolicy(nftId: bigint) {
        setLoading(true);
        try {
            console.log("fetching policies for address", address);
            const signer = await getSigner();
            await fetchPolicyData(
                [nftId], 
                signer,
                async (policy: PolicyData) => { 
                    try {
                        const cityData = await getCity(policy.locationId);
                        policy.locationName = cityData.name.local;
                        dispatch(addOrUpdatePolicy(policy)); 
                    } catch (err) {
                        handleError(err);
                    }
                });
        } catch(err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    async function transferPolicy(nftId: bigint, recipient: string) {
        setLoading(true);
        try {
            const signer = await getSigner();
            await transferNft(nftId, recipient, signer);
            dispatch(resetPolicies());
            router.push(PATH_MYPOLICIES);
        } catch (err) {
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
        transferPolicy,
    }
}