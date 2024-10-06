export interface FlightStatus {
    status: string;
    departureAirportFsCode: string;
    arrivalAirportFsCode: string;
    publishedDepartureTime: string | null;
    publishedArrivalTime: string | null;
    actualArrivalTime: string | null;
    delay: number;
}
