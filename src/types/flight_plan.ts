export interface FlightPlan {
    status: string;
    departureAirportFsCode: string;
    arrivalAirportFsCode: string;
    departureTimeUtc: number | null;
    departureTimeLocal: string | null;
    departureTimeLocalTimezone: string | null;
    arrivalTimeUtc: number | null;
    arrivalTimeLocal: string | null;
    arrivalTimeLocalTimezone: string | null;
    delay: number;
}
