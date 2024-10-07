export interface FlightPlan {
    status: string;
    departureAirportFsCode: string;
    arrivalAirportFsCode: string;
    departureTimeLocal: string | null;
    departureTimeUtc: string | null;
    arrivalTimeLocal: string | null;
    arrivalTimeUtc: string | null;
    delay: number;
}
