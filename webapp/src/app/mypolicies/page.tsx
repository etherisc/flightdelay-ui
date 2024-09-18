'use client';
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { Button, Trans } from "component-lib";
import { useEnvContext } from "next-runtime-env";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import InvalidChain from "../../components/InvalidChain/invalid_chain";
import PoliciesList from "../../components/PoliciesList/policies_list";
import { useWallet } from "../../hooks/onchain/use_wallet";
import { useMyPolicies } from "../../hooks/use_mypolicies";
import { RootState } from "../../redux/store";
import { useAnalytics } from "../../hooks/use_analytics";
import { DURATION_SNACKBAR_ERROR, ZINDEX_SNACKBAR } from "../../config/theme";

export default function Page() {
    const { connectWallet, reconnectWallet } = useWallet();
    const { t } = useTranslation();
    const { NEXT_PUBLIC_EXPECTED_CHAIN_ID, NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();

    const isExpectedChain = useSelector((state: RootState) => (state.wallet.isExpectedChain));
    const address = useSelector((state: RootState) => (state.wallet.address));
    const walletConnecting = useSelector((state: RootState) => (state.wallet.connecting));    
    const policies = useSelector((state: RootState) => (state.myPolicies.policies));
    const { trackPageView } = useAnalytics();    

    const { loading, error: policyFetchError, fetchPolicies } = useMyPolicies(address);

    // this will be set to true if the wallet is not connected after loading the page and checking if wallet can be reconnected
    const [ walletNotConnected, setWalletNotConnected ] = useState(false);
    const [snackBarErrorMsg, setSnackBarErrorMsg] = useState(null);

    // try to reconnect when page is loaded
    useEffect(() => {
        trackPageView("mypolicies", "/mypolicies");
        
        async function reconnedTheWallet() { 
            const walletReconnected = await reconnectWallet();
            console.log("walletReconnected", walletReconnected);
            setWalletNotConnected(! walletReconnected);
        }
        reconnedTheWallet();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch policies when address changes
    useEffect(() => {
        if (address !== null) {
            fetchPolicies();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]); 

    useEffect(() => {
        if (policyFetchError) {
            setSnackBarErrorMsg(t('error.fetching_policies_failed'));
        }
    }, [policyFetchError, t]);

    let alert = undefined;
    if (walletNotConnected && !walletConnecting) {
        alert = (<Alert severity="info" sx={{ mb: 2 }}>
            <Trans k="mypolicies.wallet_not_connected" /><br/>
            <Button variant="text" sx={{ p: 0 }} onClick={connectWallet}><Trans k="action.retry" /></Button>
        </Alert>);
    }
    
    if (! isExpectedChain) {
        if (NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined && NEXT_PUBLIC_EXPECTED_CHAIN_NAME !== undefined) {
            alert = (<InvalidChain />);
        }
    }

    let content = <></>;
    if (address !== null) {
        content = (<Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ flexGrow: 0 }}>
                <PoliciesList loading={loading} policies={policies} />
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                <Link href="/signup" passHref style={{ minWidth: '100%'}}>
                    <Button fullwidth>
                        <Trans k="action.buy_policy" />
                    </Button>
                </Link>
            </Box>
            <Snackbar 
                open={snackBarErrorMsg !== null} 
                onClose={() => setSnackBarErrorMsg(null)}
                autoHideDuration={DURATION_SNACKBAR_ERROR} 
                sx={{ zIndex: ZINDEX_SNACKBAR }}>
                <Alert severity="error" variant='filled' onClose={() => setSnackBarErrorMsg(null)}>
                    {snackBarErrorMsg}
                </Alert>
            </Snackbar>
        </Box>);
    }

    return(<Box sx={{ width: '100%', p: 2 }}>
        {alert}
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography color="primary" variant="h2" sx={{ }}>
                <Trans k="mypolicies.title" />
            </Typography>
        </Box>
        {content}
    </Box>)
}

