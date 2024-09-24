export interface FlightStatus {
    status: string;
    departureAirportFsCode: string;
    arrivalAirportFsCode: string;
    publishedDepartureTime: string;
    publishedArrivalTime: string;
    actualArrivalTime: string | null;
    delay: number;
}
