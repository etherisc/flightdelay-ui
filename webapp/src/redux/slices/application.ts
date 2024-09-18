import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { CoverageType } from '../../types/coverage_type';
import { Coordinates } from '../../types/coordinates';


export interface ApplicationData {
    locationId: number | null,
    locationCoordinates: Coordinates | null,
    locationName: string | null,
    endDate: number | null,
    premium: number | null,
    type: CoverageType | null,
    triggerMmi: number | null,
    sumInsured: number | null,
    referralCode: string | null,
    referralDiscount: number | null,
    finalPremium: number | null,
    nftId: string | null,
}

const initialState: ApplicationData = {
    locationId: null,
    locationCoordinates: null,
    locationName: null,
    endDate: null,
    premium: null,
    type: null,
    triggerMmi: null,
    sumInsured: null,
    referralCode: null,
    referralDiscount: null,
    finalPremium: null,
    nftId: null,
}

/**
 * The application slice contains all the data related to the application. This data is confirmed by the user and relevant for the final application. 
 */
export const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
        setEndDate(state, action: PayloadAction<number>) {
            state.endDate = action.payload;
        },
        setLocation(state, action: PayloadAction<{ id: number, coords: Coordinates, name: string }>) {
            state.locationId = action.payload.id;
            state.locationCoordinates = action.payload.coords;
            state.locationName = action.payload.name;
        },
        setPremium(state, action: PayloadAction<number>) {
            state.premium = action.payload;
            state.finalPremium = action.payload;
        },
        setType: (state, action: PayloadAction<{ type: CoverageType, sumInsured: number, triggerMmi: number}>) => {
            state.type = action.payload.type;
            state.sumInsured = action.payload.sumInsured;
            state.triggerMmi = action.payload.triggerMmi;
        },
        setReferralCode: (state, action: PayloadAction<{code: string, referralDiscount: number, finalPremium: number}>) => {
            state.referralCode = action.payload.code;
            state.finalPremium = action.payload.finalPremium;
            state.referralDiscount = action.payload.referralDiscount;
        },
        setNftId: (state, action: PayloadAction<string>) => {
            state.nftId = action.payload;
        },
        resetApplication(state) {
            // assign initial state
            Object.assign(state, initialState);
        }
    },
});

// Action creators are generated for each case reducer function
export const { 
    setLocation, 
    setEndDate,
    setPremium,
    setType,
    setReferralCode,
    setNftId,
    resetApplication,
} = applicationSlice.actions;

export default applicationSlice.reducer;
