import { Autocomplete, TextField } from "@mui/material";
import dayjs from "dayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { INPUT_VARIANT } from "../../config/theme";
import Trans from "../Trans/trans";
import Grid from '@mui/material/Grid2';
import { carriers } from "../../config/carriers.json";
import { DatePicker } from "@mui/x-date-pickers";

export type IApplicationFormValues = {
    carrier: string;
    flightNumber: string;
    departureDate: dayjs.Dayjs;
};

export default function ApplicationForm() {

    const { handleSubmit, control } = useForm<IApplicationFormValues>({
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: false,
        defaultValues: {
            carrier: "",
            flightNumber: "",
            departureDate: dayjs().add(1, 'w'),
        }
    });


    const onSubmit: SubmitHandler<IApplicationFormValues> = (data) => {
        console.log(data);
    };

    const carrierOptionsList = () => 
        carriers.map((e) => ({ label: e.name, code: e.iata })).sort((a, b) => a.label.localeCompare(b.label));

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
                                        />}
                                />}
                        />
                    
                </Grid>
                <Grid size={4}>
                    <Controller
                        name="flightNumber"
                        control={control}
                        rules={{ 
                            required: true, 
                            pattern: /^[0-9]+$/,
                            // min: 1,
                            // max: maxAmount
                        }}
                        render={({ field }) => 
                            <TextField 
                                label={<Trans k="flightNumber" />}
                                fullWidth
                                variant={INPUT_VARIANT}
                                {...field} 
                                data-testid="flightNumber"
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
                                label={<Trans k="departureData" />}
                                format="YYYY-MM-DD"
                                slotProps={{ 
                                    textField: { 
                                        variant: INPUT_VARIANT,
                                        fullWidth: true, 
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