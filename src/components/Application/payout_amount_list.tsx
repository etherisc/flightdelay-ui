import { Box, Typography } from "@mui/material";
import { useEnvContext } from "next-runtime-env";
import { useTranslation } from "react-i18next";
import { PayoutAmounts } from "../../redux/slices/flightData";
import { formatAmount } from "../../utils/amount";

export default function PayoutAmountsList({ amounts } : { amounts: PayoutAmounts | null }) {
    const { t } = useTranslation();
    return <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Element amount={amounts?.delayed} text={t('delayed')} />
        <Element amount={amounts?.cancelled} text={t('cancelled')} />
        <Element amount={amounts?.diverted} text={t('diverted')} />
    </Box>;
}

function Element({ amount, text }: { amount?: bigint, text?: string }) {
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();
    
    return <Box sx={{ 
        flex: 1,
        flexGrow: 1,
        p: 2, 
        m: 1, 
        border: '1px', 
        borderRadius: 4,
        backgroundColor: '#D1E5DD',
        textAlign: 'center',
    }}
    >
    {text}
    <br />
    <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(amount)}</Typography>
</Box>
}