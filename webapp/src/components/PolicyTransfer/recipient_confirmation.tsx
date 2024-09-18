import { Box, Typography, useTheme } from "@mui/material";
import { Button, Trans } from "component-lib";

export function RecipientConfirmation({
    nftId,
    recipientAddress,
    onAbort,
    onTransfer,
} : {
    nftId: bigint,
    recipientAddress: string,
    onAbort: () => void,
    onTransfer: (nftId: bigint, recipientAddress: string) => Promise<void>,
}) {
    const theme = useTheme();

    return (<Box>
        <Typography variant="body1">
            <Trans k="mypolicies.transfer.confirmation" values={{ nftId: nftId.toString() }}>
                <b>confirm</b>
            </Trans>
        </Typography>
        <Typography variant="h2" sx={{ lineBreak: 'anywhere', py: 2 }}>{recipientAddress}</Typography>
        <Button fullwidth sx={{ my: 1 }} onClick={onAbort} color={theme.palette.secondary.main}><Typography color={theme.palette.secondary.contrastText}><Trans k="action.abort"/></Typography></Button>
        <Button fullwidth sx={{ my: 1 }} onClick={async () => await onTransfer(nftId, recipientAddress)}><Trans k="action.continue"/></Button>
    </Box>);
}