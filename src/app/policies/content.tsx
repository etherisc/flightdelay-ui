'use client';

import { useEnvContext } from "next-runtime-env";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import InvalidChain from "../../components/InvalidChain/invalid_chain";
import { useAnalytics } from "../../hooks/use_analytics";
import { RootState } from "../../redux/store";
import PoliciesList from "../../components/PoliciesList/policies_list";
import { Card, CardContent, CardHeader, Theme, useMediaQuery } from "@mui/material";
import { useWallet } from "../../hooks/onchain/use_wallet";
import PoliciesListMobile from "../../components/PoliciesList/policies_list_mobile";
import { useTranslation } from "react-i18next";
import { useMyPolicies } from "../../hooks/use_mypolicies";



export function Content() {
    const { reconnectWallet } = useWallet();
    const { t } = useTranslation();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const { trackPageView } = useAnalytics();
    const isExpectedChain = useSelector((state: RootState) => (state.wallet.isExpectedChain));
    const { NEXT_PUBLIC_EXPECTED_CHAIN_ID, NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();

    const address = useSelector((state: RootState) => (state.wallet.address));
    const policies = useSelector((state: RootState) => state.policies.policies);
    const risks = useSelector((state: RootState) => state.policies.risks);
    const loading = useSelector((state: RootState) => state.policies.loading);

    const { fetchPolicies } = useMyPolicies();
    
    useEffect(() => {
        reconnectWallet();
        trackPageView("policies", "/policies");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch policies when address changes
    useEffect(() => {
        if (address !== null) {
            fetchPolicies();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]); 

    if (! isExpectedChain) {
        if (NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined && NEXT_PUBLIC_EXPECTED_CHAIN_NAME !== undefined) {
            return (<InvalidChain />);
        }
    }

    return (<Card>
        <CardHeader title={t('policies', { ns: 'common'})} />
        <CardContent>
            {isMobile && <PoliciesListMobile policies={policies} risks={risks} loading={loading} />}
            {!isMobile && <PoliciesList />}
        </CardContent>
    </Card>);   
}