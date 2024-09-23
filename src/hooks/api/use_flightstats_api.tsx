import dayjs from "dayjs";
import { ScheduledFlight } from "../../types/flightstats/scheduledFlight";

export function useFlightstatsApi() {
    async function fetchFlightData(carrier: string, flightNumber: string, departureDate: dayjs.Dayjs): Promise<ScheduledFlight[]> {
        console.log("fetching flight data for", carrier, flightNumber, departureDate);
        const uri = `/api/flightstats/schedule/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}/${encodeURIComponent(departureDate.format('YYYY-MM-DD'))}`;
        const res = await fetch(uri);
        
        if (! res.ok) {
            throw new Error(`Error fetching flightstats data: ${res.statusText}`);
        }
        const jsonResponse = await res.json();

        if (jsonResponse.scheduledFlights === undefined) {
            return [];
        }

        if (jsonResponse.scheduledFlights.length === 0) {
            return [];
        }
        
        return jsonResponse.scheduledFlights as ScheduledFlight[];
    }

    return {
        fetchFlightData,
    }
}
