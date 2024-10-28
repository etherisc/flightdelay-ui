import dayjs from "dayjs";
import { PayoutAmounts } from "../../redux/slices/flightData";
import { Airport } from "../../types/flightstats/airport";
import { ScheduledFlight } from "../../types/flightstats/scheduledFlight";
import { Reason } from "../../types/errors";

export function useFlightstatsApi() {    
    async function fetchFlightData(carrier: string, flightNumber: string, departureDate: dayjs.Dayjs): Promise<{ flights: ScheduledFlight[], airports: Airport[], carrier: string, flightNumber: string}> {
        console.log("fetching flight data for", carrier, flightNumber, departureDate);
        const uri = `/api/flightstats/schedule/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}/${encodeURIComponent(departureDate.format('YYYY-MM-DD'))}`;
        const res = await fetch(uri);

        if (! res.ok) {
            throw new Error(`Error fetching flightstats data: ${res.statusText}`);
        }
        const jsonResponse = await res.json();
        // console.log(jsonResponse);

        if (jsonResponse.scheduledFlights === undefined) {
            return { flights: [], airports: [], carrier, flightNumber};
        }

        if (jsonResponse.scheduledFlights.length === 0) {
            return { flights: [], airports: [], carrier, flightNumber};
        }
        
        return {
            flights: jsonResponse.scheduledFlights as ScheduledFlight[],
            airports: jsonResponse.appendix.airports as Airport[],
            carrier,
            flightNumber,
        };
    }

    async function fetchQuote(carrier: string, flightNumber: string): Promise<{premium: number, ontimepercent: number, payouts: PayoutAmounts, statistics: bigint[], carrier: string, flightNumber: string, error?: Reason}> {
        console.log("fetching quote for", carrier, flightNumber);
        const uri = `/api/quote/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}`;
        const res = await fetch(uri);
        const j = await res.json();

        if (! res.ok) {
            if (res.status === 404) {
                const error = Reason.NOT_ENOUGH_DATA_FOR_QUOTE;
                return {premium: 0, ontimepercent: 0, payouts: {delayed: BigInt(0), cancelled: BigInt(0), diverted: BigInt(0)}, statistics: [], carrier, flightNumber, error};
            } else if (res.status === 503) {
                console.log("not enough capacity for quote");
                return {premium: 0, ontimepercent: 0, payouts: {delayed: BigInt(0), cancelled: BigInt(0), diverted: BigInt(0)}, statistics: [], carrier, flightNumber, error: Reason.NOT_ENOUGH_CAPACITY};
            } else {
                throw new Error(`Error fetching quote data: ${res.statusText}`);
            }
        }

        j.carrier = carrier;
        j.flightNumber = flightNumber;
        return j;
    }

    async function fetchAirport(iata: string): Promise<Airport> {
        console.log("fetching airport data for", iata);
        const uri = `/api/flightstats/airport/iata/${iata}`;
        const res = await fetch(uri);

        if (! res.ok) {
            throw new Error(`Error fetching airport data: ${res.statusText}`);
        }

        const jsonResponse = await res.json();
        
        console.log("airports response", jsonResponse);

        if (jsonResponse.airports === undefined) {
            console.log("No airport data found");
        }
        if (jsonResponse.airports.length === 0) {
            console.log("No airport data found");
        }

        return jsonResponse.airports[0] as Airport;
    }

    return {
        fetchFlightData,
        fetchQuote,
        fetchAirport,
    }
}
