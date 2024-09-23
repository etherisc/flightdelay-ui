import { Autocomplete, TextField } from "@mui/material";
import dayjs from "dayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { INPUT_VARIANT } from "../../config/theme";
import Trans from "../Trans/trans";
import Grid from '@mui/material/Grid2';
import carrierData from "../../config/carrierData.json";
import { DatePicker } from "@mui/x-date-pickers";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApplicationForm } from "../../hooks/use_application_form";
import { useDebounce } from "@react-hooks-hub/use-debounce";

export type IApplicationFormValues = {
    carrier: string;
    flightNumber: string;
    departureDate: dayjs.Dayjs;
};

export default function ApplicationForm() {
    const { t } = useTranslation();
    const { fetchFlightData } = useApplicationForm();

    const debouncedFetchFlightData = useDebounce(fetchFlightData, 600);

    const { handleSubmit, control, formState, watch } = useForm<IApplicationFormValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        shouldFocusError: false,
        defaultValues: {
            carrier: "",
            flightNumber: "",
            departureDate: dayjs().add(1, 'w'),
        }
    });

    const formValues = watch();
    useEffect(() => {
        console.log(formValues);
        if (formState.isValid) {
            debouncedFetchFlightData(formValues.carrier, formValues.flightNumber, formValues.departureDate);
        }
    }, [formValues, debouncedFetchFlightData, formState.isValid]);


    const onSubmit: SubmitHandler<IApplicationFormValues> = (data) => {
        // do nothing, just log for now
        console.log(data);
        console.log(formState);
    };
    
    const carrierOptionsList = () => 
        carrierData.carriers.map((e) => ({ label: e.name, code: e.iata })).sort((a, b) => a.label.localeCompare(b.label));

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
            <Grid container spacing={2}>
                <Grid size={4}>
                    <Controller
                        name="carrier"
                        control={control}
                        rules={{ 
                            required: true, 
                            // pattern: /^[0-9]+$/,
                            // min: 1,
                            // max: maxAmount
                        }}
                        render={({ field }) => 
                            <Autocomplete
                                fullWidth
                                options={carrierOptionsList()}
                                renderInput={(params) => 
                                    <TextField 
                                        {...field}
                                        {...params} 
                                        label={<Trans k="carrier" />} 
                                        error={formState.errors.carrier !== undefined}
                                        helperText={formState.errors.carrier !== undefined 
                                            ? t(`error.field.carrier`)  : ""}
                                        />}
                                onChange={(e, data) => field.onChange(data?.code)}
                                />}
                        />
                    
                </Grid>
                <Grid size={4}>
                    <Controller
                        name="flightNumber"
                        control={control}
                        rules={{ 
                            required: true, 
                            // reg for 1-4 digits
                            pattern: /^[0-9]{1,4}$/,
                            // min: 1,
                            // max: 9999
                        }}
                        render={({ field }) => 
                            <TextField 
                                label={<Trans k="flightNumber" />}
                                {...field} 
                                variant={INPUT_VARIANT}
                                fullWidth
                                data-testid="flightNumber"
                                error={formState.errors.flightNumber !== undefined}
                                helperText={formState.errors.flightNumber !== undefined 
                                    ? t(`error.field.flightNumber`)  : ""}
                                />}
                            />
                </Grid>
                <Grid size={4}>
                    <Controller
                        name="departureDate"
                        control={control}
                        rules={{ 
                            required: true, 
                        }}
                        render={({ field }) => 
                            <DatePicker
                                {...field} 
                                label={<Trans k="departureDate" />}
                                format="YYYY-MM-DD"
                                slotProps={{ 
                                    textField: { 
                                        variant: INPUT_VARIANT,
                                        fullWidth: true, 
                                        error: formState.errors.departureDate !== undefined,
                                        helperText: formState.errors.departureDate !== undefined 
                                            ? t(`error.field.departureDate`)  : ""
                                    }
                                }}
                                disablePast={true}
                                data-testid="departureDate"
                                // minDate={coverageUntilMin}
                                maxDate={dayjs().add(1, 'y')} 
                                />}
                        />
                </Grid>
            </Grid>
            
            
        </form>
    );
}