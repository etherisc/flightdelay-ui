'use client';

import { Box, Alert, Container } from "@mui/material";
import { useSelector } from "react-redux";
import TopBar from "../components/TopBar/topbar";
import { RootState } from "../redux/store";
import Trans from "../components/Trans/trans";
import { useEnvContext } from "next-runtime-env";

export function AppBaseLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const isExpectedChain = useSelector((state: RootState) => state.wallet.isExpectedChain);
    const { NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();

    if (! isExpectedChain) {
        return (<Box>
            <Container disableGutters maxWidth={false}>
                <TopBar />
            </Container>
            <Container maxWidth="lg" sx={{ p: 2, py: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity='error'><Trans k='error.wrong_chain' values={{ chain: NEXT_PUBLIC_EXPECTED_CHAIN_NAME}}/></Alert>
                </Box>
            </Container>
        </Box>);
    }

    return (
        <Box>
            <Container disableGutters maxWidth={false}>
                <TopBar />
            </Container>
            <Container maxWidth="lg" sx={{ p: 2, py: 1 }}>
                {children}
            </Container>
        </Box>
    )
}
