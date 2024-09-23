import { Autocomplete, TextField } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { DatePicker } from "@mui/x-date-pickers";
import { useDebounce } from "@react-hooks-hub/use-debounce";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import carrierData from "../../config/carrierData.json";
import { INPUT_VARIANT } from "../../config/theme";
import { setFlight } from "../../redux/slices/flightData";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchFlightData } from "../../redux/thunks/flightData";
import Trans from "../Trans/trans";
import { DEPARTURE_DATE_DATE_FROM, DEPARTURE_DATE_DAYS_MIN, DEPARTURE_DATE_DATE_TO, DEPARTURE_DATE_DAYS_MAX } from "../../config/constants";

export type IApplicationFormValues = {
    carrier: string;
    flightNumber: string;
    departureDate: dayjs.Dayjs;
};

export default function ApplicationForm() {
    const { t } = useTranslation();
    const dispatch = useDispatch() as AppDispatch;
    const stateCarrier = useSelector((state: RootState) => state.flightData.carrier);
    const stateFlightNumber = useSelector((state: RootState) => state.flightData.flightNumber);
    const stateDepartureDate = useSelector((state: RootState) => state.flightData.departureDate);

    const departureDateMin = (DEPARTURE_DATE_DATE_FROM !== '') ? dayjs(DEPARTURE_DATE_DATE_FROM) : dayjs().add(DEPARTURE_DATE_DAYS_MIN, 'd');
    const departureDateMax = (DEPARTURE_DATE_DATE_TO !== '') ? dayjs(DEPARTURE_DATE_DATE_TO) : dayjs().add(DEPARTURE_DATE_DAYS_MAX, 'd');

    const sendRequest = async (carrier: string, flightNumber: string, departureDate: dayjs.Dayjs) => {
        // only send again if data is changed
        if (carrier !== stateCarrier || flightNumber !== stateFlightNumber || departureDate.toISOString() !== stateDepartureDate) {
            dispatch(setFlight({ carrier, flightNumber, departureDate }));
            dispatch(fetchFlightData({carrier, flightNumber, departureDate}));
        }
    };

    const debouncedFetchFlightData = useDebounce(sendRequest, 600);

    const { handleSubmit, control, formState, watch } = useForm<IApplicationFormValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        shouldFocusError: false,
        defaultValues: {
            carrier: "",
            flightNumber: "",
            departureDate: departureDateMin,
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
                <Grid size={4}>
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
                                minDate={departureDateMin}
                                maxDate={departureDateMax}
                                />}
                        />
                </Grid>
            </Grid>
        </form>
    );
}