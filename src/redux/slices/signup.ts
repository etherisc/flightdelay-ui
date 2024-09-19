import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { Coordinates } from '../../types/coordinates';
import { CoverageType } from '../../types/coverage_type';
import { QApiCity } from '../../types/qapi/city';
import { logErrorOnBackend } from '../../utils/logger';
import { findClosestCites, loadPayoutScale, loadPremiumData } from '../thunks/signup';

export interface CoverageTypeDetails {
    type: CoverageType,
    minimumPremium: number | null,
    maximumPremium: number | null,
    ratio: number | null,
    premium: number | null,
    sumInsured: number | null,
    payoutScheme: PayoutSchemeEntry[] | null,
}

export interface PayoutSchemeEntry {
    mmiLevel: number,
    payoutPercentage: number,
    payout: number | null,
}

export interface SignupState {
    step: number,
    userCoordinates: Coordinates | null,
    citiesOnMap: QApiCity[],
    availableTypes: CoverageTypeDetails[],
    referralCode: string | null,
    cityFetchFailedReason: string | null,
    premiumDataFetchFailedReason: string | null,
    payoutScaleFetchFailedReason: string | null,
}

/**
 * The signup slice contains all the data related to the signup process. This is mostly tentative data that is shown to the user to be selected or confirmed. 
 */
const initialState: SignupState = {
    step: 0,
    userCoordinates: null,
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
    citiesOnMap: [],
    referralCode: null,
    cityFetchFailedReason: null,
    premiumDataFetchFailedReason: null,
    payoutScaleFetchFailedReason: null,
}

export const accountSlice = createSlice({
    name: 'signup',
    initialState,
    reducers: {
        setStep(state, action: PayloadAction<number>) {
            state.step = action.payload;
        },
        setUserCoordinates(state, action: PayloadAction<Coordinates>) {
            state.userCoordinates = action.payload;
        },
        // setSumInsured(state, action: PayloadAction<{ type: CoverageType, sumInsured: number }>) {
        //     // const details = state.availableTypes.find(t => t.type === action.payload.type);
        //     // const sumInsured = action.payload.sumInsured;
        //     // details.sumInsured = sumInsured;
        //     // // set payout scheme
        //     // details.payoutScheme[0].payout = sumInsured * 0.25;
        //     // details.payoutScheme[1].payout = sumInsured * 0.5;
        //     // details.payoutScheme[2].payout = sumInsured * 1.0;
        // },
        setPreloadedReferralCode(state, action: PayloadAction<string>) {
            state.referralCode = action.payload;
        },
        resetSignup(state) {
            // assign initial state
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadPremiumData.pending, (state/*, action*/) => {
            state.premiumDataFetchFailedReason = null;
        });
        builder.addCase(loadPremiumData.fulfilled, (state, action) => {
            const { response } = action.payload;
            state.availableTypes[0].minimumPremium = response.type1.minimum_premium;
            state.availableTypes[0].maximumPremium = response.type1.maximum_premium;
            state.availableTypes[0].ratio = response.type1.payout_ratio;
            state.availableTypes[1].minimumPremium = response.type2.minimum_premium;
            state.availableTypes[1].maximumPremium = response.type2.maximum_premium;
            state.availableTypes[1].ratio = response.type2.payout_ratio;
        });
        builder.addCase(loadPremiumData.rejected, (state, action) => {
            logErrorOnBackend(`${action.error.message}`, JSON.stringify(action.error), 'signup/loadPremiumData');
            // state.premiumDataFetchFailedReason = action.error.message;
        });
        builder.addCase(loadPayoutScale.pending, (state/*, action*/) => {
            state.payoutScaleFetchFailedReason = null;
        });
        builder.addCase(loadPayoutScale.fulfilled, (/*state, action*/) => {
            // const { response } = action.payload;
            // const fragileShieldScales = response.policies.find(x => x.policy_type === 'type1')?.mmi_payout_scale;
            // const fragileShieldIdx = state.availableTypes.findIndex(t => t.type === CoverageType.FragileShield);
            // state.availableTypes[fragileShieldIdx].payoutScheme = fragileShieldScales.map(p => {
            //     return { 
            //         mmiLevel: p.mmi_level, 
            //         payoutPercentage: p.payout,
            //         payout: null,
            //     } as PayoutSchemeEntry;
            // });
            // const homeGuardScales = response.policies.find(x => x.policy_type === 'type2')?.mmi_payout_scale;
            // const homeGuardTypeIdx = state.availableTypes.findIndex(t => t.type === CoverageType.HomeGuard);
            // state.availableTypes[homeGuardTypeIdx].payoutScheme = homeGuardScales.map(p => {
            //     return { 
            //         mmiLevel: p.mmi_level, 
            //         payoutPercentage: p.payout,
            //         payout: null,
            //     } as PayoutSchemeEntry;
            // });
            
        });
        builder.addCase(loadPayoutScale.rejected, (state, action) => {
            logErrorOnBackend(`${action.error.message}`, JSON.stringify(action.error), 'signup/loadPayoutScale');
            // state.payoutScaleFetchFailedReason = action.error.message;
        });
        builder.addCase(findClosestCites.pending, (state/*, action*/) => {
            state.cityFetchFailedReason = null;
        });
        builder.addCase(findClosestCites.fulfilled, (state, action) => {
            state.citiesOnMap = action.payload;
        });
        builder.addCase(findClosestCites.rejected, (state, action) => {
            console.log('findClosestCites.rejected', action);
            // // handle request budget exhausted special case (wait a bit more before retrying)
            // if (action.error.message.includes('err_id: 103')) {
            //     logErrorOnBackend(`${action.error.message}`, JSON.stringify(action.error), 'signup/findClosestCites');
            //     state.cityFetchFailedReason = '103';
            //     state.citiesOnMap = [];
            // } else {
            //     logErrorOnBackend(`${action.error.message}`, JSON.stringify(action.error), 'signup/findClosestCites');
            //     state.cityFetchFailedReason = action.error.stack;
            //     state.citiesOnMap = [];
            // }
        });
    },
});

// Action creators are generated for each case reducer function
export const { 
    setStep, resetSignup,
    setUserCoordinates,
    // setSumInsured,
    setPreloadedReferralCode,
} = accountSlice.actions;

export default accountSlice.reducer;
