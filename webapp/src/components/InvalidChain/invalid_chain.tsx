import { Alert, AlertTitle } from "@mui/material";
import { Button, Trans } from "component-lib";
import { useWallet } from "../../hooks/onchain/use_wallet";
import { useEnvContext } from "next-runtime-env";
import { useEffect } from "react";
import { ensureError } from "../../utils/error";

export default function InvalidChain() {
    const { connectWallet, switchChain } = useWallet();
    const { NEXT_PUBLIC_EXPECTED_CHAIN_ID, NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();

    useEffect(() => {
        async function autoSwitchChain() {
            
            try {
                await switchChain();
                await connectWallet();
            } catch(err) {
                const error = ensureError(err);
                console.log("auto switch chain failed", error);
            }
        }
        if (NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined && NEXT_PUBLIC_EXPECTED_CHAIN_NAME !== undefined) {
            autoSwitchChain();
        }
    }, [NEXT_PUBLIC_EXPECTED_CHAIN_ID, NEXT_PUBLIC_EXPECTED_CHAIN_NAME, switchChain, connectWallet]);

    return (<>
        <Alert severity="error">
            <AlertTitle><Trans k="error.wrong_chain" /></AlertTitle>
            <Trans k="error.wrong_chain_description" values={{ chain: NEXT_PUBLIC_EXPECTED_CHAIN_NAME }} />
            <br/>
            <Button variant="text" sx={{ px: 0, py: 2 }} onClick={connectWallet}><Trans k="action.retry" /></Button>
        </Alert>
        <Alert severity="info" sx={{ mt: 2 }}>
            <Trans k="error.wrong_chain_description2" values={{ chain: NEXT_PUBLIC_EXPECTED_CHAIN_NAME }}>
                <a href={`https://chainlist.org/chain/${NEXT_PUBLIC_EXPECTED_CHAIN_ID}`} target="_blank" rel="noreferrer">chainlist.org</a>
            </Trans>
        </Alert>
    </>);
}