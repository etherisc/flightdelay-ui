import dayjs from "dayjs";
import { useState } from "react";

export function useApplicationForm() {
    const [ loading ] = useState(false);
    const [ error ] = useState<Error | undefined>(undefined);
    // const router = useRouter();

    // const dispatch = useDispatch();

    async function fetchFlightData(carrier: string, flightNumber: string, departureDate: dayjs.Dayjs) {
        console.log("fetching flight data for", carrier, flightNumber, departureDate);
    }

    return {
        fetchFlightData,
        loading,
        error,
    }
}