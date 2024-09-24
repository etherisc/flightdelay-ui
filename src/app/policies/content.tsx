'use client';

import { useEnvContext } from "next-runtime-env";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import InvalidChain from "../../components/InvalidChain/invalid_chain";
import { useAnalytics } from "../../hooks/use_analytics";
import { RootState } from "../../redux/store";
import PoliciesList from "../../components/PoliciesList/policies_list";
import { Card, CardContent } from "@mui/material";
import { useWallet } from "../../hooks/onchain/use_wallet";



export function Content() {
    const { reconnectWallet } = useWallet();
    const { trackPageView } = useAnalytics();
    const isExpectedChain = useSelector((state: RootState) => (state.wallet.isExpectedChain));
    const { NEXT_PUBLIC_EXPECTED_CHAIN_ID, NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();

    const policies = useSelector((state: RootState) => state.policies.policies);
    const loading = useSelector((state: RootState) => state.policies.loading);
    
    useEffect(() => {
        reconnectWallet();
        trackPageView("policies", "/policies");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (! isExpectedChain) {
        if (NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined && NEXT_PUBLIC_EXPECTED_CHAIN_NAME !== undefined) {
            return (<InvalidChain />);
        }
    }

    return (<Card>
        <CardContent>
            <PoliciesList policies={policies} loading={loading} />
        </CardContent>
    </Card>);   
}