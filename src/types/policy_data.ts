import { FlightPlan } from "./flight_plan";

// **Important**: only serializeable data here (no bigint, etc.)
export type PolicyData = {
    nftId: string;
    riskId: string;
    payoutAmount: string;
    carrier: string;
    flightNumber: string;
    departureDate: string;
    flightPlan: FlightPlan | null;
}
