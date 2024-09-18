import { Box, TextField } from "@mui/material";
import { Button, Trans } from "component-lib";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { INPUT_VARIANT } from "../../config/theme";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type IReferralCodeFormValues = {
    referralCode: string;
}

export default function ReferralCodeForm({
    onApplyReferralCode,
    referralCode,
}: {
    onApplyReferralCode?: (referralCode: string) => Promise<void>,
    referralCode: string,
}) {
    const { t } = useTranslation();
    const { handleSubmit, control, formState } = useForm<IReferralCodeFormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
        defaultValues: {
            referralCode: referralCode ?? "",
        }
    });

    const errors = useMemo(() => formState.errors, [formState]);

    const onSubmit: SubmitHandler<IReferralCodeFormValues> = data => {
        console.log("referral code", data);
        onApplyReferralCode(data.referralCode);
    };

    return (<form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
            <Controller
                name="referralCode"
                control={control}
                rules={{ 
                    required: true, 
                    min: 1,
                }}
                render={({ field }) => 
                    <TextField 
                        sx={{ mr: 1, flexGrow: 1, backgroundColor: 'white' }}
                        variant={INPUT_VARIANT}
                        {...field} 
                        error={errors.referralCode !== undefined}
                        helperText={errors.referralCode !== undefined 
                            ? t(`error.field.${errors.referralCode.type}`, { "ns": "common" }) 
                            : ""}
                        data-testid="referralCode"
                        />}
                    />
            <Button sx={{ flexGrow: 0, flexShrink: 0 }} type="submit"><Trans k="checkout.apply_referral_code"/></Button>
        </Box>
    </form>);
}