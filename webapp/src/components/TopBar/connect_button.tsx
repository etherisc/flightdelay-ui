import { faWallet } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SvgIcon } from "@mui/material";
import { Button, Trans } from "component-lib";
import { useWallet } from "../../hooks/onchain/use_wallet";

export default function ConnectButton() {
    const { connectWallet } = useWallet();

    return (<Button onClick={connectWallet}>
        <SvgIcon sx={{ mr: 1 }} fontSize="small">
            <FontAwesomeIcon icon={faWallet} />
        </SvgIcon>
        <Trans k="action.connect" />
    </Button>);
}
