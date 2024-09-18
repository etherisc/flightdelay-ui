import { InputAdornment, TextField } from "@mui/material";
import { Trans } from "component-lib";
import { useEffect, useMemo } from "react";
import { Control, Controller, FormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { INPUT_VARIANT } from "../../config/theme";
import { IPremiumAmountFormValues } from "./enter_premium_amount";
import { EVENT_SIGNUP_AMOUNT_ABOVE_UPPER_LIMIT, EVENT_SIGNUP_AMOUNT_BELOW_LOWER_LIMIT, useAnalytics } from "../../hooks/use_analytics";

interface FormProps {
    control: Control<IPremiumAmountFormValues, unknown>; 
    formState: FormState<IPremiumAmountFormValues>;
    symbol: string;
    minimumPremium: number;
    maximumPremium: number;
}    

export default function Form(props: FormProps) {
    const { t } = useTranslation();
    const { trackEvent } = useAnalytics();

    const errors = useMemo(() => props.formState.errors, [props.formState]);

    useEffect(() => {
        if (errors.amount !== undefined && errors.amount.type == 'min') {
            trackEvent(EVENT_SIGNUP_AMOUNT_BELOW_LOWER_LIMIT);
        } else if (errors.amount !== undefined && errors.amount.type == 'max') {
            trackEvent(EVENT_SIGNUP_AMOUNT_ABOVE_UPPER_LIMIT);
        }
    }, [errors, trackEvent]);
    
    return(<>
            <Controller
                name="amount"
                control={props.control}
                rules={{ 
                    required: true, 
                    pattern: /^[0-9]+$/,
                    min: props.minimumPremium,
                    max: props.maximumPremium,
                }}
                render={({ field }) => 
                    <TextField 
                        label={<Trans k="amount" />}
                        fullWidth
                        variant={INPUT_VARIANT}
                        {...field} 
                        InputProps={{
                            startAdornment: <InputAdornment position="start">{props.symbol}</InputAdornment>,
                        }}
                        inputProps={{
                            style: { textAlign: "right" }
                        }}
                        error={errors.amount !== undefined}
                        helperText={errors.amount !== undefined 
                            ? ( errors.amount.type == 'pattern' 
                                    ? t(`error.field.numberType`, { "ns": "common"}) 
                                    : t(`error.field.${errors.amount.type}`, { "ns": "common", "min": props.minimumPremium, "max": props.maximumPremium }) 
                            ) : ""}
                        data-testid="amount"
                        />}
                    />
    </>);
}