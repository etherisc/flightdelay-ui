'use client';

import { Box, Dialog, Slide, Typography } from "@mui/material";
import Trans from "../Trans/trans";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ConnectButton from "./connect_button";
import { forwardRef, useState } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { ZINDEX_WALLET } from "../../config/theme";
import Wallet from "./wallet";
import { JazziconAvatar } from "../(basic_widgets)/Jazzicon/jazzicon_avatar";
import { grey } from "@mui/material/colors";
import Image from "next/image";

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
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 4, backgroundColor: grey[200] }}>
            <Image src="/assets/images/etherisc_logo_blue.svg" alt="Etherisc Logo" width={120} height="46"/>
            <Typography variant="h2" component="div" sx={{ flexGrow: 0, ml: 2 }}>
                <Trans k="nav.apply" />
            </Typography>
            <Typography variant="h2" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                <Trans k="nav.policies" />
            </Typography>
            {wallet}
            <Dialog
                fullScreen
                open={showWallet}
                onClose={toggleWallet}
                TransitionComponent={Transition}
                sx={{
                    zIndex: ZINDEX_WALLET,
                    pt: 12,
                    '& .MuiDialog-paper': {
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    }
                }}
                // Paper={Card}
                // PaperComponent={Card}
            >
                <Wallet 
                    onDisconnect={toggleWallet}
                    />
            </Dialog>
        </Box>
    );
}

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});
