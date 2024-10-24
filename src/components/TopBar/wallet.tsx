import { faFile, faPlane, faPowerOff, faRefresh, faTableList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, IconButton, Link, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useEnvContext } from 'next-runtime-env';
import { useSelector } from 'react-redux';
import { JazziconAvatar } from '../(basic_widgets)/Jazzicon/jazzicon_avatar';
import { useWallet } from '../../hooks/onchain/use_wallet';
import { RootState } from '../../redux/store';
import { formatAmount } from '../../utils/amount';
import { parseBigInt } from '../../utils/bigint';
import { PATH_APPLICATION, PATH_MYPOLICIES } from '../../utils/paths';
import Button from '../Button/button';
import Trans from '../Trans/trans';
import Address from './address';

export default function Wallet({
    onDisconnect,
}: {
    onDisconnect?: () => void;
}) {
    const { disconnectWallet, refreshBalance } = useWallet();
    const address = useSelector((state: RootState) => state.wallet.address) || '';
    const balanceUsdc = useSelector((state: RootState) => state.wallet.balanceUsdc) || '0';
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();

    const symbol = NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL || 'FUSD';


    async function disconnect() {
        await disconnectWallet();
        if (onDisconnect) {
            onDisconnect();
        }
    }
    
    return (<Box 
        sx={{
        display: 'flex',
        p: 2,
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
                        <FontAwesomeIcon icon={faPlane} />
                    </Box>
                    <Trans k="nav.apply"/>
                </Button>
            </Link>
            <Link href={PATH_MYPOLICIES}>
                <Button fullwidth sx={{ my: 1 }}>
                    <Box sx={{ mr: 2 }}>
                        <FontAwesomeIcon icon={faTableList} />
                    </Box>
                    <Trans k="nav.policies" />
                </Button>
            </Link>
            <Link href="/contracts">
                <Button fullwidth sx={{ my: 1 }}>
                    <Box sx={{ mr: 2 }}>
                        <FontAwesomeIcon icon={faFile} />
                    </Box>
                    <Trans k="nav.contracts" />
                </Button>
            </Link>
        </Box>
    </Box>);
}
