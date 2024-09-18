import { Alert, Box, TextField } from "@mui/material";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { INPUT_VARIANT } from "../../config/theme";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQApiApplication } from "../../hooks/api/use_qapi_application";
import Button from "../Button/button";
import Trans from "../Trans/trans";

export type INotifyMeFormValues = {
    email: string;
}

export default function NotifyMeForm({ nftId } : { nftId: bigint }) {
    const { t } = useTranslation();
    const { submitNotificationDetails } = useQApiApplication();
    const [ receivedDetails, setReceivedDetails ] = useState<boolean>(false);
    const [ receivedDetailsError, setReceivedDetailsError ] = useState<boolean>(false);

    const { handleSubmit, control, formState } = useForm<INotifyMeFormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
        defaultValues: {
            email: "",
        }
    });

    const errors = useMemo(() => formState.errors, [formState]);

    const onSubmit: SubmitHandler<INotifyMeFormValues> = async data => {
        setReceivedDetails(false);
        setReceivedDetailsError(false);
        console.log("notify me", data);
        try {
            await submitNotificationDetails(nftId, data.email);
            setReceivedDetails(true);
        } catch (e) {
            console.error("notify me error", e);
            setReceivedDetailsError(true);
        }
    };

    return (<Box sx={{ display: 'flex', flexDirection: 'column'}}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Controller
                    name="email"
                    control={control}
                    rules={{ 
                        required: true, 
                        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    }}
                    render={({ field }) => 
                        <TextField 
                            sx={{ mr: 1, flexGrow: 1 }}
                            label={<Trans k="email" />}
                            variant={INPUT_VARIANT}
                            {...field} 
                            error={errors.email !== undefined}
                            helperText={errors.email !== undefined 
                                ? ( errors.email.type == 'pattern' 
                                        ? t(`error.field.emailType`, { "ns": "common"}) 
                                        : t(`error.field.${errors.email.type}`, { "ns": "common" }) 
                                ) : ""}
                            data-testid="email"
                            />}
                        />
                <Button sx={{ flexGrow: 0, flexShrink: 0, px: 3 }} type="submit"><Trans k="checkout_success.notify_me"/></Button>
            </Box>
        </form>
        { receivedDetails && <Alert severity="success" sx={{ mt: 2 }} ><Trans k="checkout_success.we_will_notify_you" /></Alert>}
        { receivedDetailsError && <Alert severity="error" sx={{ mt: 2 }} ><Trans k="checkout_success.notification_details_submission_error" /></Alert>}

    </Box>);
}