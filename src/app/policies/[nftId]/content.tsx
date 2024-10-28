'use client';

import { LinearProgress } from "@mui/material";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Policy } from "../../../components/Policy/policy";
import { useWallet } from "../../../hooks/onchain/use_wallet";
import { useAnalytics } from "../../../hooks/use_analytics";
import { useMyPolicies } from "../../../hooks/use_mypolicies";
import { RootState } from "../../../redux/store";


export default function Content({ nftId } : { nftId: string }) {
    const { reconnectWallet } = useWallet();
    const { trackPageView } = useAnalytics();

    const address = useSelector((state: RootState) => (state.wallet.address));
    const loading = useSelector((state: RootState) => state.policy.loadingPolicy);
    const policy = useSelector((state: RootState) => state.policy.policy);

    const { fetchPolicy } = useMyPolicies();
    
    useEffect(() => {
        if (address === null) {
            reconnectWallet();
        }
        trackPageView("policy", "/policies/" + nftId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch policies when address changes
    useEffect(() => {
        if (address !== null && !loading) {
            fetchPolicy(nftId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]); 

    if (policy === null) {
        return <LinearProgress />;
    }

    return <Policy policy={policy} />;
}

