'use client';

import { Box, Dialog, Link, Slide, Theme, Typography, useMediaQuery } from "@mui/material";
import { grey } from "@mui/material/colors";
import { TransitionProps } from "@mui/material/transitions";
import Image from "next/image";
import React, { forwardRef, useState } from "react";
import { useSelector } from "react-redux";
import { JazziconAvatar } from "../(basic_widgets)/Jazzicon/jazzicon_avatar";
import { ZINDEX_WALLET } from "../../config/theme";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";
import ConnectButton from "./connect_button";
import Wallet from "./wallet";

export default function TopBar() {
    const address = useSelector((state: RootState) => (state.wallet.address));
    const [ showWallet, setShowWallet ] = useState(false);

    function toggleWallet() {
        setShowWallet(! showWallet);
    }

    let wallet = null;
    if (address) {
        wallet = <JazziconAvatar address={address} onClick={toggleWallet} />;
    } else {
        wallet = <ConnectButton />;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 4, mb: { xs: 0, md: 6} , backgroundColor: grey[200] }}>
            <Image src="/assets/images/etherisc_logo_blue.svg" alt="Etherisc Logo" width={120} height="46"/>
            <Typography variant="h2" component="div" sx={{ flexGrow: 0, ml: 2, display: { 'xs': 'none', 'md': 'inherit'} }} >
                <Link href="/apply" color="inherit" sx={{ textDecoration: 'none' }}>
                    <Trans k="nav.apply" />
                </Link>
            </Typography>
            <Typography variant="h2" component="div" sx={{ flexGrow: 1, ml: 2, display: { 'xs': 'none', 'md': 'inherit'} }}>
                <Link href="/policies" color="inherit" sx={{ textDecoration: 'none' }}>
                    <Trans k="nav.policies" />
                </Link>
            </Typography>
            <Box sx={{ flexGrow: 1 }}>&nbsp;</Box>
            {wallet}
            <React.Fragment>
                <Dialog
                    fullScreen
                    open={showWallet}
                    onClose={toggleWallet}
                    TransitionComponent={Transition}
                    sx={{
                        zIndex: ZINDEX_WALLET,
                        pt: { md: 2},
                        top: { xs: 300, md: 0 },
                        maxWidth: { md: '25rem' },
                        marginLeft: { xs: 2, md: 'auto'},
                        marginRight: 2,
                        marginBottom: 2,
                        '& .MuiDialog-paper': {
                            borderRadius: 8,
                        }
                    }}
                    >
                    <Wallet onDisconnect={toggleWallet} />
                </Dialog>
            </React.Fragment>
        </Box>
    );
}

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

    return <Slide direction={ isSmallScreen ? 'up' : 'left'} ref={ref} {...props} />;
});
