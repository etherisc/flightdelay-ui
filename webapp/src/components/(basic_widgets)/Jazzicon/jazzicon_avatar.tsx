import { Avatar, IconButton, SxProps } from "@mui/material";
import dynamic from "next/dynamic";

const Jazzicon = dynamic(() => import('./jazzicon'), {
    ssr: false,
});

export function JazziconAvatar({ address, onClick, sx }: { address: string, onClick?: () => void, sx?: SxProps }) {

    return (<IconButton onClick={onClick} sx={{ p: 0, ...sx }}>
        <Avatar alt="Remy Sharp" >
            <Jazzicon address={address} />
        </Avatar>
    </IconButton>);
}
