import { SignupState } from "../../../../../src/redux/slices/signup";
import { CoverageType } from "../../../../../src/types/coverage_type";

export function mockSignupBasic() {
    return {
        step: 0,
        userCoordinates: {
            // zurich
            lat: 47.46667,
            lng: 8.65,
        },
        availableTypes: [
            {
                type: CoverageType.FragileShield,
                minimumPremium: null,
                maximumPremium: null,
                ratio: null,
                premium: null,
                sumInsured: null,
                payoutScheme: null,
            },
            {
                type: CoverageType.HomeGuard,
                minimumPremium: null,
                maximumPremium: null,
                ratio: null,
                premium: null,
                sumInsured: null,
                payoutScheme: null,
            },
        ],
        referralCode: null,
        cityFetchFailedReason: null,
        premiumDataFetchFailedReason: null,
        payoutScaleFetchFailedReason: null,
    } as SignupState;
}