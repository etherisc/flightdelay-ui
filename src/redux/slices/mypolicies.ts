import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { PolicyData } from '../../types/policy_data';

export interface MyPoliciesState {
    policies: PolicyData[]
}

const initialState: MyPoliciesState = {
    policies: []
}

export const myPoliciesSlice = createSlice({
    name: 'myPolicies',
    initialState,
    reducers: {
        addOrUpdatePolicy(state, action: PayloadAction<PolicyData>) {
            const index = state.policies.findIndex(policy => policy.nftId === action.payload.nftId);
            if (index >= 0) {
                state.policies[index] = action.payload;
                return;
            }
            state.policies.push(action.payload);
        },
        resetPolicies(state) {
            state.policies = [];
        },
    },
});

// Action creators are generated for each case reducer function
export const { 
    addOrUpdatePolicy,
    resetPolicies,
} = myPoliciesSlice.actions;

export default myPoliciesSlice.reducer;
