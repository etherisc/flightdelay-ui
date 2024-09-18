import { Coordinates } from "./coordinates";
import { CoverageType } from "./coverage_type";

// **Important**: only serializeable data here (no bigint, etc.)
export type PolicyData = {
    nftId: string;
    state: PolicyState;
    type: CoverageType;
    premium: string;
    sumInsured: string;
    locationId: number;
    locationName: string;
    locationCoordinates: Coordinates;
    claimedAmount: string;
    createdAt: number;
    expirationAt: number;
    payoutScale: [PolicyDataScaleEntry, PolicyDataScaleEntry, PolicyDataScaleEntry] | null,
}

export interface PolicyDataScaleEntry {
    mmiLevel: string;
    payoutAmount: string;
}


export enum PolicyState {
    APPLIED,
    REVOKED,
    DECLINED,
    UNDERWRITTEN,
    CONFIRMED,
    EXPECTED,
    ACTIVE,
    PAUSED,
    CLOSED,
    ARCHIVED,
    PAID
}
