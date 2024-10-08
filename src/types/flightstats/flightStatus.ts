export interface FlightStatus {
    status: string;
    delays?: Delays;
}

export interface Delays {
    arrivalGateDelayMinutes: number;
}