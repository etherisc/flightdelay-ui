import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, Card, CardActions, CardContent, CardHeader, SvgIcon } from "@mui/material";
import Image from "next/image";
import Button from "../Button/button";
import { useWallet } from "../../hooks/onchain/use_wallet";
import ApplicationForm from "./application_form";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Trans from "../Trans/trans";

export default function Application() {
    const { connectWallet } = useWallet();
    const errorReason = useSelector((state: RootState) => state.flightData.errorReason);
    
    let error = <></>;

    if (errorReason !== null) {
        error = <Box sx={{ py: 2 }}>
            <Alert severity="error"><Trans k="error.no_flight_found" /></Alert>
        </Box>;
    }

    return (<>
        <Card>
            <CardHeader
                avatar={
                    <Image src="/assets/images/etherisc_logo_bird_blue.svg" alt="Etherisc Logo" height={64} width={64} />
                    }
                title="Etherisc Flightdelay Protection"
                    />
            <CardContent>
                <ApplicationForm />
                {error}
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