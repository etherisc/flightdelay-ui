import { Typography } from "@mui/material";
import { useEnvContext } from "next-runtime-env";
import { useTranslation } from "react-i18next";
import { formatAmount } from "../../utils/amount";
import { PayoutAmounts } from "../../redux/slices/flightData";

export default function PayoutAmountsList({ amounts } : { amounts: PayoutAmounts | null }) {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();
    return <>
        {t('delayed')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(amounts?.delayed)}</Typography>
        / 
        {t('cancelled')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(amounts?.cancelled)}</Typography>
        / 
        {t('diverted')} <Typography fontWeight={700} component="span">{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(amounts?.diverted)}</Typography>
    </>;
}