import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardActions, CardContent, CardHeader, SvgIcon } from "@mui/material";
import Image from "next/image";
import Button from "../Button/button";
import { useWallet } from "../../hooks/onchain/use_wallet";

export default function Application() {
    const { connectWallet } = useWallet();

    return (<>
        <Card>
            <CardHeader
                avatar={
                    <Image src="/assets/images/etherisc_logo_bird_blue.svg" alt="Etherisc Logo" height={64} width={64} />
                    }
                title="Etherisc Flightdelay Protection"
                    />
            <CardContent>
                Put form here
            </CardContent>
            <CardActions>
                {/* TODO: only show connect button when wallet not connected */}
                <Button color="primary" fullwidth onClick={connectWallet}>
                    <SvgIcon sx={{ mr: 1 }} fontSize="small">
                        <FontAwesomeIcon icon={faWallet} />
                    </SvgIcon>
                    Connect wallet
                </Button>
            </CardActions>
        </Card>
    </>);
}