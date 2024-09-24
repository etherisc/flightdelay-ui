
// **Important**: only serializeable data here (no bigint, etc.)
export type PolicyData = {
    nftId: string;
    createdAt: number;
    carrier: string;
    flightNumber: string;
    departureDate: number;
    flightState: FlightState;
}


export enum FlightState {
    EXPECTED,
    EN_ROUTE,
    PUNCTUAL,
    DELAYED,
    CANCELLED,
    DIVERTED,
}
