import { faWallet } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SvgIcon } from "@mui/material";

import { useWallet } from "../../hooks/onchain/use_wallet";
import Button from "../Button/button";
import Trans from "../Trans/trans";

export default function ConnectButton() {
    const { connectWallet } = useWallet();

    return (<Button onClick={connectWallet}>
        <SvgIcon sx={{ mr: 1 }} fontSize="small">
            <FontAwesomeIcon icon={faWallet} />
        </SvgIcon>
        <Trans k="action.connect" />
    </Button>);
}
