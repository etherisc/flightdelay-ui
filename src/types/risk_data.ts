import { FlightPlan } from "./flight_plan";

// **Important**: only serializeable data here (no bigint, etc.)
export type RiskData = {
    riskId: string;
    carrier: string;
    flightNumber: string;
    departureDate: string;
    flightPlan: FlightPlan | null;
}

