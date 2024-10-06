import { FlightStatus } from "./flightstats/flightStatus";

// **Important**: only serializeable data here (no bigint, etc.)
export type RiskData = {
    riskId: string;
    carrier: string;
    flightNumber: string;
    departureDate: string;
    flightData: FlightStatus | null;
}

