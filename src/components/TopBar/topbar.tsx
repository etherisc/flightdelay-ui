'use client';

import { Box, Dialog, IconButton, Link, Menu, MenuItem, Slide, SvgIcon, Theme, Typography, useMediaQuery } from "@mui/material";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function TopBar() {
    const isConnected = useSelector((state: RootState) => state.wallet.isConnected);
    const address = useSelector((state: RootState) => (state.wallet.address));
    const [ showWallet, setShowWallet ] = useState(false);
    const [ showMenu, setShowMenu ] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    function toggleWallet() {
        setShowWallet(! showWallet);
    }

    function toggleMenu(event: React.MouseEvent<HTMLElement>) {
        setShowMenu(! showMenu);
        setAnchorEl(showMenu ? null : event.currentTarget);
    }

    function goto(path: string) {
        return () => {
            window.location.href = path;
        }
    }

    let wallet = null;
    if (isConnected && address !== null) {
        wallet = <JazziconAvatar address={address} onClick={toggleWallet} />;
    } else {
        wallet = <ConnectButton />;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, pl: { xs: 2, md: 4 }, pr: 4, mb: { xs: 0, md: 2} , backgroundColor: grey[200] }}>
            <IconButton onClick={toggleMenu} sx={{ p: 0 }}>
                <SvgIcon sx={{ mr: 1, display: { xs: 'block', md: 'none' } }} fontSize="small" color="primary">
                    <FontAwesomeIcon icon={faBars} />
                </SvgIcon>
            </IconButton>
            <Menu
                sx={{ display: { xs: 'block', md: 'none' } }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={toggleMenu}
                >
                <MenuItem onClick={goto("/apply")}><Trans k="nav.apply" /></MenuItem>
                <MenuItem onClick={goto("/policies")}><Trans k="nav.policies" /></MenuItem>
                <MenuItem onClick={goto("/contracts")}><Trans k="nav.contracts" /></MenuItem>
            </Menu>
            <Image src="/assets/images/etherisc_logo_blue.svg" alt="Etherisc Logo" width={120} height="46"/>
            <Typography variant="h2" component="div" sx={{ flexGrow: 0, ml: 3, display: { 'xs': 'none', 'md': 'inherit'} }} >
                <Link href="/apply" color="inherit" sx={{ textDecoration: 'none' }}>
                    <Trans k="nav.apply" />
                </Link>
            </Typography>
            <Typography variant="h2" component="div" sx={{ flexGrow: 0, ml: 3, display: { 'xs': 'none', 'md': 'inherit'} }}>
                <Link href="/policies" color="inherit" sx={{ textDecoration: 'none' }}>
                    <Trans k="nav.policies" />
                </Link>
            </Typography>
            <Typography variant="h2" component="div" sx={{ flexGrow: 1, ml: 3, display: { 'xs': 'none', 'md': 'inherit'} }}>
                <Link href="/contracts" color="inherit" sx={{ textDecoration: 'none' }}>
                    <Trans k="nav.contracts" />
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
