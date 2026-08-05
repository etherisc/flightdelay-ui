import { Avatar, IconButton, SxProps } from "@mui/material";
import Jazzicon from './jazzicon';

export function JazziconAvatar({ address, onClick, sx }: { address: string, onClick?: () => void, sx?: SxProps }) {
    return (<IconButton onClick={onClick} sx={{ p: 0, ...sx }}>
        <Avatar alt="Wallet avatar" >
            <Jazzicon address={address} />
        </Avatar>
    </IconButton>);
}
