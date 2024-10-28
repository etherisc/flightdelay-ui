import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { PolicyData } from '../../types/policy_data';
import { fetchAirportData } from '../thunks/policy';

export interface PoliciesState {
    loadingPolicy: boolean;
    loadingAirports: number;
    policy: PolicyData | null;
}

const initialState: PoliciesState = {
    loadingPolicy: false,
    loadingAirports: 0,
    policy: null,
}

export const policySlice = createSlice({
    name: 'policies',
    initialState,
    reducers: {
        setLoadingPolicy(state, action: PayloadAction<boolean>) {
            state.loadingPolicy = action.payload;
        },
        // addOrUpdatePolicy(state, action: PayloadAction<{ nftId: bigint, data: FlightPolicyData}>) {
        setPolicy(state, action: PayloadAction<PolicyData>) {
            state.policy = action.payload
        },
        resetPolicy(state) {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAirportData.pending, (state, /*action*/) => {
            state.loadingAirports++;
        });
        builder.addCase(fetchAirportData.fulfilled, (state, action) => {
            state.loadingAirports--;
            if (state.policy == null) {
                return;
            }
            if (state.policy.flightPlan == null) {
                return;
            }
            const { response } = action.payload;
            if (response == null) {
                return;
            }
            const { iata, name } = response;
            if (state.policy.flightPlan.arrivalAirportFsCode === iata) {
                state.policy.flightPlan.arrivalAirportName = name;
            }
            if (state.policy.flightPlan.departureAirportFsCode === iata) {
                state.policy.flightPlan.departureAirportName = name;
            }
        });
        builder.addCase(fetchAirportData.rejected, (state, action) => {
            console.log('fetchAirportData.rejected');
            state.loadingAirports--;
            console.log(action.payload);
        });
    },
});

// Action creators are generated for each case reducer function
export const { 
    setLoadingPolicy,
    setPolicy,
    resetPolicy,
} = policySlice.actions;

export default policySlice.reducer;
