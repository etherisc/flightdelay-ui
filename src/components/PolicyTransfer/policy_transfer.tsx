import { Box, TextField, Typography } from "@mui/material";

import { useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { INPUT_VARIANT } from "../../config/theme";
import { PolicyData } from "../../types/policy_data";
import { parseBigInt } from "../../utils/bigint";
import { RecipientConfirmation } from "./recipient_confirmation";
import { EVENT_TRANSFER_NFT_ABORT, EVENT_TRANSFER_NFT_SEND, useAnalytics } from "../../hooks/use_analytics";
import Trans from "../Trans/trans";
import Button from "../Button/button";

export type ITransferFormValues = {
    recipient: string;
}

export function PolicyTransfer({ 
    policy,
    onTransfer,
} : { 
    policy: PolicyData,
    onTransfer: (nftId: bigint, recipientAddress: string) => Promise<void>,
}) {
    const { trackEvent } = useAnalytics();
    const { t } = useTranslation();
    const nftId = parseBigInt(policy.nftId);
    const [ showRecipientConfirmation, setShowRecipientConfirmation ] = useState<boolean>(false);
    
    const { handleSubmit, control, formState, watch } = useForm<ITransferFormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
        defaultValues: {
            recipient: "",
        }
    });

    const errors = useMemo(() => formState.errors, [formState]);
    const recipientAddress = watch('recipient');

    const onSubmit: SubmitHandler<ITransferFormValues> = async data => {
        console.log("transfer", data);
        setShowRecipientConfirmation(true);
        trackEvent(EVENT_TRANSFER_NFT_SEND);
    };

    function abort() {
        setShowRecipientConfirmation(false);
        trackEvent(EVENT_TRANSFER_NFT_ABORT);
    }

    return (<Box sx={{ p: 2 }}>
        <Typography variant="body1"><Trans k="mypolicies.transfer.instructions" values={{ nftId: nftId.toString() }}/></Typography>
        <Typography variant="body1">
            <Trans k="mypolicies.transfer.warning">
                <b>important</b>
            </Trans>
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', flexDirection: 'column', placeItems: 'center', gap: 2, py: 2 }}>
                <Controller
                    name="recipient"
                    control={control}
                    rules={{ 
                        required: true, 
                        pattern: /^0x[a-fA-F0-9]{40}$/,
                    }}
                    render={({ field }) => 
                        <TextField 
                            label={<Trans k="mypolicies.transfer.recipient" />}
                            variant={INPUT_VARIANT}
                            {...field} 
                            fullWidth
                            disabled={showRecipientConfirmation}
                            error={errors.recipient !== undefined}
                            helperText={errors.recipient !== undefined 
                                ? ( errors.recipient.type == 'pattern' 
                                        ? t(`error.field.walletType`) 
                                        : t(`error.field.${errors.recipient.type}`) 
                                ) : ""}
                            data-testid="recipient"
                            />}
                        />
                <Button type="submit" disabled={showRecipientConfirmation} fullwidth><Trans k="action.transfer"/></Button>
            </Box>
        </form>
        { showRecipientConfirmation &&
            <RecipientConfirmation 
                nftId={nftId}
                recipientAddress={recipientAddress}
                onAbort={abort}
                onTransfer={onTransfer}
                />
        }
    </Box>)
}
