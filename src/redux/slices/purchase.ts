import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface PurchaseState {
    isExecuting: boolean,
    policyNftId: string | null,
    riskNftId: string | null,
}

const initialState: PurchaseState = {
    isExecuting: false,
    policyNftId: null,
    riskNftId: null,
}

export const purchaseSlice = createSlice({
    name: 'purchase',
    initialState,
    reducers: {
        setExecuting(state, action: PayloadAction<boolean>) {
            state.isExecuting = action.payload;
        },
        setPolicy(state, action: PayloadAction<{ policyNftId: string, riskId: string}>) {
            state.policyNftId = action.payload.policyNftId;
            state.riskNftId = action.payload.riskId;
        },
        resetPurchase(state) {
            Object.assign(state, initialState);
        }
    },
});

// Action creators are generated for each case reducer function
export const { 
    setExecuting,
    setPolicy,
    resetPurchase,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;
