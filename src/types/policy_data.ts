import { FlightStatus } from "./flightstats/flightStatus";

// **Important**: only serializeable data here (no bigint, etc.)
export type PolicyData = {
    nftId: string;
    createdAt: number;
    carrier: string;
    flightNumber: string;
    departureDate: number;
    flightState: FlightState;
    flightData: FlightStatus | null;
}


export enum FlightState {
    SCHEDULED,
    EN_ROUTE,
    PUNCTUAL,
    DELAYED,
    CANCELLED,
    DIVERTED,
}
