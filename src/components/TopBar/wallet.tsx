import { Box, IconButton, Link, Typography } from '@mui/material';
import Address from './address';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSignature, faPowerOff, faRefresh, faShoppingCart } from '@fortawesome/pro-regular-svg-icons';
import { grey } from '@mui/material/colors';
import { useWallet } from '../../hooks/onchain/use_wallet';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { formatAmount } from '../../utils/amount';
import { parseBigInt } from '../../utils/bigint';
import { PATH_MYPOLICIES, PATH_APPLICATION } from '../../utils/paths';
import { JazziconAvatar } from '../(basic_widgets)/Jazzicon/jazzicon_avatar';
import Button from '../Button/button';
import Trans from '../Trans/trans';

export default function Wallet({
    onDisconnect,
}: {
    onDisconnect?: () => void;
}) {
    const { disconnectWallet, refreshBalance } = useWallet();
    const address = useSelector((state: RootState) => state.wallet.address) || '';
    const balanceEth = useSelector((state: RootState) => state.wallet.balanceEth) || '0';
    const balanceUsdc = useSelector((state: RootState) => state.wallet.balanceUsdc) || '0';
    const symbol = useSelector((state: RootState) => state.common.tokenSymbol);
    const symbolEth = useSelector((state: RootState) => state.common.tokenSymbolEth);


    async function disconnect() {
        await disconnectWallet();
        if (onDisconnect) {
            onDisconnect();
        }
    }
    
    return (<Box sx={{
        display: 'flex',
        flexDirection: 'column',
    }}>
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
        }}>
            <JazziconAvatar address={address} />
            <Address />
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', pr: 2 }} >
                <IconButton onClick={disconnect} sx={{ p: 0 }} data-testid="disconnect-button">
                    <FontAwesomeIcon icon={faPowerOff} fontSize="24" color={grey[700]} />
                </IconButton>
            </Box>
        </Box>
        <Box sx={{ py: 2 }}>
            <Typography variant="h6">
                {symbolEth} {formatAmount(parseBigInt(balanceEth), 18, 2)}
            </Typography>
            <Typography variant="h6">
                {symbol} {formatAmount(parseBigInt(balanceUsdc))}
            </Typography>
        </Box>
        <Box sx={{ py: 2 }}>
            <Button fullwidth sx={{ my: 1 }} onClick={refreshBalance}>
                <Box sx={{ mr: 2 }}>
                    <FontAwesomeIcon icon={faRefresh} />
                </Box>
                <Trans k="action.refresh"/>
            </Button>
            <Link href={PATH_APPLICATION}>
                <Button fullwidth sx={{ my: 1 }}>
                    <Box sx={{ mr: 2 }}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                    </Box>
                    <Trans k="action.buy_policy"/>
                </Button>
            </Link>
            <Link href={PATH_MYPOLICIES}>
                <Button fullwidth sx={{ my: 1 }}>
                    <Box sx={{ mr: 2 }}>
                        <FontAwesomeIcon icon={faFileSignature} />
                    </Box>
                    <Trans k="mypolicies.title" />
                </Button>
            </Link>
        </Box>
    </Box>);
}
