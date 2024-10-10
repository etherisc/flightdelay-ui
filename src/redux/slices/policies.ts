import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { PolicyData } from '../../types/policy_data';
import { RiskData } from '../../types/risk_data';

export interface PoliciesState {
    loading: boolean;
    policies: PolicyData[]
    risks: RiskData[];
}

const initialState: PoliciesState = {
    loading: false,
    policies: [],
    risks: [],
}

export const policiesSlice = createSlice({
    name: 'policies',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        addOrUpdatePolicy(state, action: PayloadAction<PolicyData>) {
            const index = state.policies.findIndex(policy => policy.nftId === action.payload.nftId);
            if (index >= 0) {
                state.policies[index] = action.payload;
                return;
            }
            state.policies.push(action.payload);
        },
        addOrUpdateRisk(state, action: PayloadAction<RiskData>) {
            const index = state.risks.findIndex(risk => risk.riskId === action.payload.riskId);
            if (index >= 0) {
                state.risks[index] = action.payload;
                return;
            }
            state.risks.push(action.payload);
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
    addOrUpdateRisk,
    setPayoutAmount,
    resetPolicies,
} = policiesSlice.actions;

export default policiesSlice.reducer;
