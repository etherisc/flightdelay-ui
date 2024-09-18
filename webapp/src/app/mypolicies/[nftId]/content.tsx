'use client';

import { Alert, Box, LinearProgress } from "@mui/material";
import { Trans } from "component-lib";
import { useSelector } from "react-redux";
import PageHeader from "../../../components/(basic_widgets)/PageHeader/page_header";
import { stringifyBigInt } from "../../../utils/bigint";
import { RootState } from "../../../redux/store";
import { useMyPolicies } from "../../../hooks/use_mypolicies";
import { useEffect } from "react";
import { useWallet } from "../../../hooks/onchain/use_wallet";
import dynamic from "next/dynamic";
import { PATH_MYPOLICIES } from "../../../utils/paths";

// this is required to ensure the leaflet map (part of Location component) is not rendered on the server (SSR). 
const Policy = dynamic(() => import('../../../components/Policy/policy'), {
    ssr: false,
});


export default function Content({ 
    nftId
} : {
    nftId: bigint
}) {
    const nftIdStr = stringifyBigInt(nftId);
    const policy = useSelector((state: RootState) => state.myPolicies.policies.find(p => p.nftId === nftIdStr));
    const symbol = useSelector((state: RootState) => state.common.tokenSymbol);
    const address = useSelector((state: RootState) => state.wallet.address);
    
    const { fetchPolicy, loading } = useMyPolicies(address);
    const { reconnectWallet } = useWallet();

    // try to reconnect when page is loaded
    useEffect(() => {
        async function reconnedTheWallet() { 
            const walletReconnected = await reconnectWallet();
            console.log("walletReconnected", walletReconnected);
            // setWalletNotConnected(! walletReconnected);
        }
        reconnedTheWallet();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch policies when address changes
    useEffect(() => {
        if (address !== null && policy === undefined) {
            fetchPolicy(nftId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, policy]); 

    if (loading) {
        return (<LinearProgress />);
    }
    
    if (policy === undefined) {
        return (<Alert severity="error"><Trans k="error.policy_not_found" /></Alert>);
    }

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
            <PageHeader text={<Trans k="mypolicies.details.title" />} href={PATH_MYPOLICIES} />
            <Policy policy={policy} symbol={symbol} />
        </Box>);
}
