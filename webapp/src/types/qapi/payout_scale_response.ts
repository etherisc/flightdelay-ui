import { ResponseBase } from "./base";

export interface PayoutScaleResponse extends ResponseBase {
    city_id: number;
    policies: QPolicy[];
}

export interface QPolicy {
    policy_type: 'type1'|'type2';
    mmi_payout_scale: ScaleEntry[];
}

export interface ScaleEntry {
    mmi_level: number;
    payout: number;
}
