import { Autocomplete, TextField } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEnvContext } from "next-runtime-env";
import { Control, Controller, FormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import carrierData from "../../config/carrierData.json";
import { INPUT_VARIANT } from "../../config/theme";
import Trans from "../Trans/trans";

export type IApplicationFormValues = {
    carrier: string;
    flightNumber: string;
    departureDate: dayjs.Dayjs;
};

export default function ApplicationForm({disableForm, formState, control}: {disableForm: boolean, formState: FormState<IApplicationFormValues>, control: Control<IApplicationFormValues, unknown> }) {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS, NEXT_PUBLIC_DEPARTURE_DATE_MAX_DAYS, NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM, NEXT_PUBLIC_DEPARTURE_DATE_DATE_TO } = useEnvContext();

    const departureDateMin = (NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM !== undefined) ? dayjs(NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM) : dayjs().add(parseInt(NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS || '14'), 'd');
    const departureDateMax = (NEXT_PUBLIC_DEPARTURE_DATE_DATE_TO !== undefined) ? dayjs(NEXT_PUBLIC_DEPARTURE_DATE_DATE_TO) : dayjs().add(parseInt(NEXT_PUBLIC_DEPARTURE_DATE_MAX_DAYS || '60'), 'd');
    
    const carrierOptionsList = () => 
        carrierData.carriers.map((e) => ({ label: `${e.name} (${e.iata})`, code: e.iata })).sort((a, b) => a.label.localeCompare(b.label));

    return (
        <form style={{ height: '100%' }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5}}>
                    <Controller
                        name="carrier"
                        control={control}
                        rules={{ 
                            required: true, 
                        }}
                        render={({ field }) => 
                            <Autocomplete
                                fullWidth
                                options={carrierOptionsList()}
                                renderInput={(params) => 
                                    <TextField 
                                        {...field}
                                        {...params} 
                                        disabled={disableForm}
                                        label={<Trans k="carrier" />} 
                                        error={formState.errors.carrier !== undefined}
                                        slotProps={{
                                            inputLabel: {
                                                shrink: true,
                                            },
                                        }}
                                        helperText={formState.errors.carrier !== undefined 
                                            ? t(`error.field.carrier`)  : ""}
                                        />}
                                onChange={(e, data) => field.onChange(data?.code)}
                                />}
                        />
                    
                </Grid>
                <Grid size={{ xs: 12, md: 3}}>
                    <Controller
                        name="flightNumber"
                        control={control}
                        rules={{ 
                            required: true, 
                            pattern: /^[0-9]{1,4}$/,
                        }}
                        render={({ field }) => 
                            <TextField 
                                label={<Trans k="flightNumber" />}
                                {...field} 
                                variant={INPUT_VARIANT}
                                fullWidth
                                disabled={disableForm}
                                data-testid="flightNumber"
                                error={formState.errors.flightNumber !== undefined}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                helperText={formState.errors.flightNumber !== undefined 
                                    ? t(`error.field.flightNumber`)  : ""}
                                />}
                            />
                </Grid>
                <Grid size={{ xs: 12, md: 4}}>
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
                                disabled={disableForm}
                                slotProps={{ 
                                    textField: { 
                                        variant: INPUT_VARIANT,
                                        fullWidth: true, 
                                        error: formState.errors.departureDate !== undefined,
                                        helperText: formState.errors.departureDate !== undefined 
                                            ? t(`error.field.departureDate`)  : ""
                                    }
                                }}
                                disablePast={! departureDateMin.isBefore(dayjs())}
                                data-testid="departureDate"
                                minDate={departureDateMin}
                                maxDate={departureDateMax}
                                />}
                        />
                </Grid>
            </Grid>
        </form>
    );
}