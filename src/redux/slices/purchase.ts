import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface PurchaseState {
    isSigning: boolean,
    isExecuting: boolean,
    policyNftId: string | null,
    riskNftId: string | null,
}

const initialState: PurchaseState = {
    isSigning: false,
    isExecuting: false,
    policyNftId: null,
    riskNftId: null,
}

export const purchaseSlice = createSlice({
    name: 'purchase',
    initialState,
    reducers: {
        setSigning(state, action: PayloadAction<boolean>) {
            state.isSigning = action.payload;
        },
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
    setSigning,
    setExecuting,
    setPolicy,
    resetPurchase,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;
