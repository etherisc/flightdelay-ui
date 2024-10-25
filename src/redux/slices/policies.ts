import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { PolicyData } from '../../types/policy_data';

export interface PoliciesState {
    loading: boolean;
    policies: PolicyData[]
}

const initialState: PoliciesState = {
    loading: false,
    policies: [],
}

export const policiesSlice = createSlice({
    name: 'policies',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        // addOrUpdatePolicy(state, action: PayloadAction<{ nftId: bigint, data: FlightPolicyData}>) {
            addOrUpdatePolicy(state, action: PayloadAction<PolicyData>) {
            const index = state.policies.findIndex(policy => policy.nftId === action.payload.nftId);
            if (index >= 0) {
                state.policies[index] = action.payload;
                return;
            }
            state.policies.push(action.payload);
        },
        setPayoutAmount(state, action: PayloadAction<{policyNftId: string, payoutAmount: string}>) {
            const index = state.policies.findIndex(policy => policy.nftId === action.payload.policyNftId);
            if (index >= 0) {
                state.policies[index].payoutAmount = action.payload.payoutAmount;
            }
        },
        resetPolicies(state) {
            Object.assign(state, initialState);
        },
    },
});

// Action creators are generated for each case reducer function
export const { 
    setLoading,
    addOrUpdatePolicy,
    setPayoutAmount,
    resetPolicies,
} = policiesSlice.actions;

export default policiesSlice.reducer;
