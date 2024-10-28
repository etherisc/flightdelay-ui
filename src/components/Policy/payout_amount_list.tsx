import { Box, Typography, useTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEnvContext } from "next-runtime-env";
import { useTranslation } from "react-i18next";
import { PayoutAmounts } from "../../redux/slices/flightData";
import { formatAmount } from "../../utils/amount";

export default function PayoutAmountsList({ amounts, state, delay } : { amounts: PayoutAmounts | null, state: string, delay: number }) {
    const { t } = useTranslation();
    const theme = useTheme();
    const colors = {
        delayed: theme.palette.secondary.main + "80", // 50% opacity
        cancelled: theme.palette.secondary.main + "80", // 50% opacity
        diverted: theme.palette.secondary.main + "80", // 50% opacity
    };
    let title = t('expected_payouts');

    if (state === 'L') {
        title = t('payout');
        if (delay > 45) {
            colors.delayed = theme.palette.primary.main + "80";
            colors.cancelled = grey[200];
            colors.diverted = grey[200];
        } else {
            colors.delayed = grey[200];
            colors.cancelled = grey[200];
            colors.diverted = grey[200];
        }
    } else if (state === 'C') {
        title = t('payout');
        colors.delayed = grey[200];
        colors.cancelled = theme.palette.primary.main + "80";
        colors.diverted = grey[200];
    } else if (state === 'D') {
        title = t('payout');
        colors.delayed = grey[200];
        colors.cancelled = grey[200];
        colors.diverted = theme.palette.primary.main + "80"
    }  

    return <>
        <Typography variant="h1" sx={{ px: 1, pb: 2 }}>{title}</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Element amount={amounts?.delayed} text={t('delayed')} color={colors.delayed} />
            <Element amount={amounts?.cancelled} text={t('cancelled')} color={colors.cancelled} />
            <Element amount={amounts?.diverted} text={t('diverted')} color={colors.diverted} />
        </Box>
    </>;
}

function Element({ amount, text, color }: { amount?: bigint, text?: string, color?: string }) {
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();
    
    return <Box sx={{ 
        flex: 1,
        flexGrow: 1,
        p: 2, 
        m: 1, 
        border: '1px', 
        borderRadius: 4,
        // backgroundColor: theme.palette.secondary.main + "80", // 50% opacity
        backgroundColor: color || grey[200],
        textAlign: 'center',
    }}
    >
    {text}
    <br />
    <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(amount)}</Typography>
</Box>
}
