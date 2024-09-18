import { InputAdornment, TextField } from "@mui/material";
import { Trans } from "component-lib";
import { Control, Controller, FormState } from "react-hook-form";
import { INPUT_VARIANT } from "../../config/theme";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export type ICoverageAmountFormValues = {
    amount: string;
};

interface FormProps {
    control: Control<ICoverageAmountFormValues, unknown>; 
    formState: FormState<ICoverageAmountFormValues>;
}    

export default function Form(props: FormProps) {
    const { t } = useTranslation();

    const errors = useMemo(() => props.formState.errors, [props.formState]);
    
    const maxAmount = 750000;
    const symbol = useSelector((state: RootState) => (state.common.tokenSymbol));
    
    return(<>
            <Controller
                name="amount"
                control={props.control}
                rules={{ 
                    required: true, 
                    pattern: /^[0-9]+$/,
                    min: 1,
                    max: maxAmount
                }}
                render={({ field }) => 
                    <TextField 
                        label={<Trans k="amount" />}
                        fullWidth
                        variant={INPUT_VARIANT}
                        {...field} 
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{symbol}</InputAdornment>,
                        }}
                        inputProps={{
                            style: { textAlign: "right" }
                        }}
                        error={errors.amount !== undefined}
                        helperText={errors.amount !== undefined 
                            ? ( errors.amount.type == 'pattern' 
                                    ? t(`error.field.numberType`, { "ns": "common"}) 
                                    : t(`error.field.${errors.amount.type}`, { "ns": "common", "min": 0, "max": maxAmount }) 
                            ) : ""}
                        data-testid="amount"
                        />}
                    />
    </>);
}