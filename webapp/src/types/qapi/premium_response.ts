import { ResponseBase } from "./base";

export interface PremiumResponse extends ResponseBase {
    city_id: number,
    type1: PremiumDetails;
    type2: PremiumDetails;
}

export interface PremiumDetails {
    minimum_premium: number;
    maximum_premium: number;
    payout_ratio: number;
}
