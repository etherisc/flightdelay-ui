import dayjs from "dayjs";
import { PayoutAmounts } from "../../redux/slices/flightData";
import { Airport } from "../../types/flightstats/airport";
import { ScheduledFlight } from "../../types/flightstats/scheduledFlight";

export function useFlightstatsApi() {
    async function fetchFlightData(carrier: string, flightNumber: string, departureDate: dayjs.Dayjs): Promise<{ flights: ScheduledFlight[], airports: Airport[], carrier: string, flightNumber: string, departureDate: dayjs.Dayjs}> {
        console.log("fetching flight data for", carrier, flightNumber, departureDate);
        const uri = `/api/flightstats/schedule/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}/${encodeURIComponent(departureDate.format('YYYY-MM-DD'))}`;
        const res = await fetch(uri);

        if (! res.ok) {
            throw new Error(`Error fetching flightstats data: ${res.statusText}`);
        }
        const jsonResponse = await res.json();
        // console.log(jsonResponse);

        if (jsonResponse.scheduledFlights === undefined) {
            return { flights: [], airports: [], carrier, flightNumber, departureDate };
        }

        if (jsonResponse.scheduledFlights.length === 0) {
            return { flights: [], airports: [], carrier, flightNumber, departureDate };
        }
        
        return {
            flights: jsonResponse.scheduledFlights as ScheduledFlight[],
            airports: jsonResponse.appendix.airports as Airport[],
            carrier,
            flightNumber,
            departureDate,
        };
    }

    async function fetchQuote(carrier: string, flightNumber: string): Promise<{premium: number, ontimepercent: number, payouts: PayoutAmounts, statistics: bigint[], carrier: string, flightNumber: string}> {
        console.log("fetching quote for", carrier, flightNumber);
        const uri = `/api/quote/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}`;
        const res = await fetch(uri);
        
        if (! res.ok) {
            throw new Error(`Error fetching quote data: ${res.statusText}`);
        }

        const j = await res.json();
        j.carrier = carrier;
        j.flightNumber = flightNumber;
        return j;
    }

    return {
        fetchFlightData,
        fetchQuote,
    }
}
