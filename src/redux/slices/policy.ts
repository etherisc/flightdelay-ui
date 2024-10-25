import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { PolicyData } from '../../types/policy_data';

export interface PoliciesState {
    loadingPolicy: boolean;
    policy: PolicyData | null;
}

const initialState: PoliciesState = {
    loadingPolicy: false,
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
});

// Action creators are generated for each case reducer function
export const { 
    setLoadingPolicy,
    setPolicy,
    resetPolicy,
} = policySlice.actions;

export default policySlice.reducer;
