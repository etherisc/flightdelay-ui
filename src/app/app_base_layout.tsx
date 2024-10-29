'use client';

import { Box, Alert, Container, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import TopBar from "../components/TopBar/topbar";
import { RootState } from "../redux/store";
import Trans from "../components/Trans/trans";
import { useEnvContext } from "next-runtime-env";
import Button from "../components/Button/button";
import { useWallet } from "../hooks/onchain/use_wallet";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { UAParser } from "ua-parser-js";
import { useEffect, useState } from "react";

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
    const uaParser = new UAParser();
    const deviceType = uaParser.getDevice().type;
    const os = uaParser.getOS().name;
    const browser = uaParser.getBrowser().name;
    const [showMobileBrowserInfo, setShowMobileBrowserInfo] = useState(false);

    
    useEffect(() => {
        const dontShowMobileBrowserInfo = window.localStorage.getItem('dontShowMobileBrowserInfo');
        console.log('deviceType', deviceType, 'os', os, "browser", browser);
        setShowMobileBrowserInfo(
            deviceType === 'mobile' 
            && (os === 'iOS' || os === 'Android')
            && (browser === 'Mobile Safari' || browser === 'Chrome' || browser === 'Firefox')
            && (dontShowMobileBrowserInfo === null)
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
        
    function openDapp() {
        window.location.href = 'dapp://flightdelay.app/';
    }

    function dismissMobileBrowserInfo() {
        localStorage.setItem('dontShowMobileBrowserInfo', 'true');
        setShowMobileBrowserInfo(false);
    }

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
                {showMobileBrowserInfo && 
                    <Alert 
                    severity='info' 
                    sx={{ m: 2 }}
                    action={
                        <Button variant="text" size="small" onClick={openDapp}><Trans k="action.switch_browser" /></Button>
                    }
                    >
                        <Trans k='info.use_mobile_wallet_browser' />
                        <br/>
                        <Button variant="text" size="small" onClick={dismissMobileBrowserInfo}>
                            <Typography variant="caption">Dismiss this message</Typography>
                        </Button>
                    </Alert>}
                
                {generalError}
                {children}
            </Container>
        </Box>
    )
}
