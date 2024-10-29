'use client';

import { Box, Alert, Container } from "@mui/material";
import { useSelector } from "react-redux";
import TopBar from "../components/TopBar/topbar";
import { RootState } from "../redux/store";
import Trans from "../components/Trans/trans";
import { useEnvContext } from "next-runtime-env";
import Button from "../components/Button/button";
import { useWallet } from "../hooks/onchain/use_wallet";
import { GoogleAnalytics } from "nextjs-google-analytics";

export function AppBaseLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const isExpectedChain = useSelector((state: RootState) => state.wallet.isExpectedChain);
    const generalErrorMessage = useSelector((state: RootState) => state.common.generalErrorMessage);
    const { NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();
    const { switchChain } = useWallet();   
    const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = useEnvContext();

    let generalError = undefined;

    if (! isExpectedChain) {
        generalError = <Container maxWidth="lg" sx={{ p: 2, py: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Alert 
                    severity='error' 
                    sx={{ }}
                    action={
                        <Button variant="text" size="small" onClick={switchChain}><Trans k="action.switch" /></Button>
                    }
                    >
                        <Trans k='error.wrong_chain' values={{ chain: NEXT_PUBLIC_EXPECTED_CHAIN_NAME}}/>
                    </Alert>
                </Box>
            </Container>;
    } else if (generalErrorMessage !== null) {
        generalError = <Container maxWidth="lg" sx={{ p: 2, py: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity='error'>
                        {generalErrorMessage}
                    </Alert>
                </Box>
            </Container>;
    }

    return (
        <Box>
            <GoogleAnalytics gaMeasurementId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            <Container disableGutters maxWidth={false}>
                <TopBar />
            </Container>
            <Container maxWidth="lg" sx={{ p: 2, py: 1 }}>
                {generalError}
                {children}
            </Container>
        </Box>
    )
}
