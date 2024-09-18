import { ApplicationData } from "../../../../../src/redux/slices/application";

export function mockEmptyApplication() {
    return {
        locationId: null,
        locationCoordinates: null,
        locationName: null,
        premium: null,
        sumInsured: null,
        triggerMmi: null,
        finalPremium: null,
        referralCode: null,
        referralDiscount: null,
        endDate: null,
        type: null,
        nftId: null,
    } as ApplicationData;
}