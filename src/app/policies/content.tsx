'use client';

import { Card, CardContent, CardHeader, Theme, useMediaQuery } from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import PoliciesList from "../../components/PoliciesList/policies_list";
import PoliciesListMobile from "../../components/PoliciesList/policies_list_mobile";
import { useWallet } from "../../hooks/onchain/use_wallet";
import { useAnalytics } from "../../hooks/use_analytics";
import { useMyPolicies } from "../../hooks/use_mypolicies";
import { RootState } from "../../redux/store";



export function Content() {
    const { reconnectWallet } = useWallet();
    const { t } = useTranslation();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const { trackPageView } = useAnalytics();

    const address = useSelector((state: RootState) => (state.wallet.address));
    const policies = useSelector((state: RootState) => state.policies.policies);
    const risks = useSelector((state: RootState) => state.policies.risks);
    const loading = useSelector((state: RootState) => state.policies.loading);

    const { fetchPolicies } = useMyPolicies();
    
    useEffect(() => {
        if (address === null) {
            reconnectWallet();
        }
        trackPageView("policies", "/policies");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch policies when address changes
    useEffect(() => {
        if (address !== null && policies.length === 0 && !loading) {
            fetchPolicies();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]); 

    return (<Card>
        <CardHeader title={t('policies', { ns: 'common'})} />
        <CardContent>
            {isMobile && <PoliciesListMobile policies={policies} risks={risks} loading={loading} />}
            {!isMobile && <PoliciesList />}
        </CardContent>
    </Card>);   
}