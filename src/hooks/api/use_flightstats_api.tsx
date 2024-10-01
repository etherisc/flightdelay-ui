import dayjs from "dayjs";
import { ScheduledFlight } from "../../types/flightstats/scheduledFlight";
import { FlightStatus } from "../../types/flightstats/flightStatus";
import { Airport } from "../../types/flightstats/airport";
import { PayoutAmounts } from "../../redux/slices/flightData";

export function useFlightstatsApi() {
    async function fetchFlightData(carrier: string, flightNumber: string, departureDate: dayjs.Dayjs): Promise<{ flights: ScheduledFlight[], airports: Airport[]}> {
        console.log("fetching flight data for", carrier, flightNumber, departureDate);
        const uri = `/api/flightstats/schedule/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}/${encodeURIComponent(departureDate.format('YYYY-MM-DD'))}`;
        const res = await fetch(uri);

        if (! res.ok) {
            throw new Error(`Error fetching flightstats data: ${res.statusText}`);
        }
        const jsonResponse = await res.json();
        // console.log(jsonResponse);

        if (jsonResponse.scheduledFlights === undefined) {
            return { flights: [], airports: [] };
        }

        if (jsonResponse.scheduledFlights.length === 0) {
            return { flights: [], airports: [] };
        }
        
        return {
            flights: jsonResponse.scheduledFlights as ScheduledFlight[],
            airports: jsonResponse.appendix.airports as Airport[],
        };
    }

    async function fetchQuote(carrier: string, flightNumber: string): Promise<{premium: number, ontimepercent: number, payouts: PayoutAmounts, statistics: bigint[]}> {
        console.log("fetching quote for", carrier, flightNumber);
        const uri = `/api/quote/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}`;
        const res = await fetch(uri);
        
        if (! res.ok) {
            throw new Error(`Error fetching quote data: ${res.statusText}`);
        }

        return await res.json();
    }

    async function fetchFlightStatus(carrier: string, flightNumber: string, departureDate: dayjs.Dayjs): Promise<{ state: string, data: FlightStatus | null}> {
        console.log("fetching flight status for", carrier, flightNumber, departureDate);
        const uri = `/api/flightstats/status/${encodeURIComponent(carrier)}/${encodeURIComponent(flightNumber)}/${encodeURIComponent(departureDate.format('YYYY-MM-DD'))}`;
        const res = await fetch(uri);

        if (! res.ok) {
            throw new Error(`Error fetching flightstats data: ${res.statusText}`);
        }
        const jsonResponse = await res.json();

        if (jsonResponse.error.httpStatusCode === "400") {
            return {
                state: "flight_not_found",
                data: null,
            }
        }

        const flightStatusData = jsonResponse.flightStatuses[0];

        if (flightStatusData.status === "S") {
            return {
                state: "ok",
                data: {
                    status: flightStatusData.status,
                    departureAirportFsCode: flightStatusData.departureAirportFsCode,
                    arrivalAirportFsCode: flightStatusData.arrivalAirportFsCode,
                    publishedDepartureTime: flightStatusData.operationalTimes.publishedDeparture.dateLocal,
                    publishedArrivalTime: flightStatusData.operationalTimes.publishedArrival.dateLocal,
                    actualArrivalTime: null,
                    delay: 0,
                },
            }
        } else {
            return {
                state: "ok",
                data: {
                    status: flightStatusData.status,
                    departureAirportFsCode: flightStatusData.departureAirportFsCode,
                    arrivalAirportFsCode: flightStatusData.arrivalAirportFsCode,
                    publishedDepartureTime: flightStatusData.operationalTimes.publishedDeparture.dateLocal,
                    publishedArrivalTime: flightStatusData.operationalTimes.publishedArrival.dateLocal,
                    actualArrivalTime: flightStatusData.operationalTimes.actualGateArrival.dateLocal,
                    delay: flightStatusData.delays.arrivalGateDelayMinutes,
                },
            }
        }
    }

    return {
        fetchFlightData,
        fetchQuote,
        fetchFlightStatus
    }
}
