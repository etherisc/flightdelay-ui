'use client';

import { Alert, Box, Typography } from "@mui/material";
import Trans from "../../../../components/Trans/trans";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import PageHeader from "../../../../components/(basic_widgets)/PageHeader/page_header";
import { ProgressModal } from "../../../../components/(basic_widgets)/ProgressModal/progress_modal";
import { PolicyTransfer } from "../../../../components/PolicyTransfer/policy_transfer";
import { useWallet } from "../../../../hooks/onchain/use_wallet";
import { useMyPolicies } from "../../../../hooks/use_mypolicies";
import { RootState } from "../../../../redux/store";
import { stringifyBigInt } from "../../../../utils/bigint";
import { PATH_MYPOLICIES } from "../../../../utils/paths";

export function PolicyTransferContent({ 
    nftId
} : {
    nftId: bigint
}) {
    const nftIdStr = stringifyBigInt(nftId);
    const policy = useSelector((state: RootState) => state.myPolicies.policies.find(p => p.nftId === nftIdStr));
    const address = useSelector((state: RootState) => state.wallet.address);

    const { fetchPolicy, loading, transferPolicy, error: transferError } = useMyPolicies(address);
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

    async function transfer(nftId: bigint, recipientAddress: string) {
        console.log("transfer to", recipientAddress);
        await transferPolicy(nftId, recipientAddress);
    }
    
    if (policy === undefined) {
        return (<Alert severity="error"><Trans k="error.policy_not_found" /></Alert>);
    }

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
            <PageHeader text={<Trans k="mypolicies.transfer.title" />} href={`${PATH_MYPOLICIES}/${nftId}`} />
            <PolicyTransfer policy={policy} onTransfer={transfer} />

            { transferError && <Alert severity="error" sx={{ mt: 2 }} ><Trans k="mypolicies.transfer.error_tx" /></Alert>}

            { loading && policy &&
                <ProgressModal>
                    <Typography variant="h3" textAlign="center" sx={{ pb: 1 }}><Trans k="trx_in_progress"/></Typography>
                </ProgressModal>}
        </Box>);
}
