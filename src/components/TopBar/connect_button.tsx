import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SvgIcon, Theme, useMediaQuery } from "@mui/material";

import { useTranslation } from "react-i18next";
import { useWallet } from "../../hooks/onchain/use_wallet";
import Button from "../Button/button";

export default function ConnectButton() {
    const { connectWallet } = useWallet();
    const { t } = useTranslation();
    const isMobileScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const title = isMobileScreen ? t('action.connect_short') : t('action.connect');

    return (<Button onClick={connectWallet} >
        <SvgIcon sx={{ mr: 1 }} fontSize="small">
            <FontAwesomeIcon icon={faWallet} />
        </SvgIcon>
        {title}
    </Button>);
}
