import { faWallet } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Typography } from "@mui/material";
import { Button, NameValueBox, Trans } from "component-lib";
import { useWallet } from "../../hooks/onchain/use_wallet";

export default function WalletNotConnected({ symbol, premium } : { symbol: string, premium: number }) {
    const { connectWallet } = useWallet();
    
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-start' }}>
            <Button fullwidth onClick={async () => await connectWallet() }>
                <FontAwesomeIcon icon={faWallet} />
                &nbsp;
                <Trans k="action.connect_wallet" />
            </Button>
            <Box sx={{ width: '100%' }}>
                <NameValueBox 
                    name={<Trans k="premium" />} 
                    value={<Typography variant="h6" color="primary">{`${symbol} ${premium}`}</Typography>} 
                    />
            </Box>
        </Box>);
}