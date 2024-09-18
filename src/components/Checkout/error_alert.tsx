'use client';

import { useTranslation } from "react-i18next";
import { BaseError } from "../../utils/error";
import { Alert } from "@mui/material";

export default function ErrorAlert({ error }: { error: Error }) {
    const { t } = useTranslation();

    let errorText = undefined;
    if (!error) {
        return <></>;
    }

    if (error instanceof BaseError) {
        switch (error.code) {
            case "CHE-001:INSUFFICIENT_BALANCE":
                errorText = t('error.insufficient_balance');
                break;
            case "ERC20-001:TX_FAILED":
                errorText = t('error.approval_tx_failed');
                break;
            case "PROD-001:TX_FAILED":
                errorText = t('error.application_tx_failed');
                break;
            case "CHE-030:REFERRAL_CODE_INVALID":
                // eslint-disable-next-line no-case-declarations
                const status = error.context;
                errorText = t('error.referral_code_' + status);
                break;
            default:
                errorText = t('error.unknown_error_during_tx');
        }
    } else {
        errorText = t('error.unknown_error_during_tx');
    }
    
    return (<Alert variant="outlined" severity="error" sx={{ mb: 2 }} data-testid="error-no-type-selected">
        {errorText}
    </Alert>);
}
