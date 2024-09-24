import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { PolicyData } from '../../types/policy_data';
import dayjs from 'dayjs';

export interface PoliciesState {
    loading: boolean;
    policies: PolicyData[]
}

const initialState: PoliciesState = {
    loading: false,
    policies: [
        {
            nftId: '0x123456',
            createdAt: dayjs().subtract(1, 'w').unix(),
            carrier: 'LX',
            flightNumber: '123',
            departureDate: dayjs().add(1, 'd').unix(),
            flightState: 0,
        }
    ]
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
        resetPolicies(state) {
            state.policies = [];
        },
    },
});

// Action creators are generated for each case reducer function
export const { 
    setLoading,
    addOrUpdatePolicy,
    resetPolicies,
} = policiesSlice.actions;

export default policiesSlice.reducer;
