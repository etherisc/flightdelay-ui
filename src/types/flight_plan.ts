export interface FlightPlan {
    status: string;
    departureAirportFsCode: string;
    departureAirportName: string | null;
    arrivalAirportFsCode: string;
    arrivalAirportName: string | null;
    departureTimeUtc: number | null;
    departureTimeLocal: string | null;
    departureTimeLocalTimezone: string | null;
    arrivalTimeUtc: number | null;
    arrivalTimeLocal: string | null;
    arrivalTimeLocalTimezone: string | null;
    delay: number;
}
