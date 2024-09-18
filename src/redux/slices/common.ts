import { createSlice } from '@reduxjs/toolkit';

export interface CommonState {
    tokenSymbol: string,
    tokenDecimals: number,
    tokenSymbolEth: string,
    snackbarErrorMessage: string | null,
}

const initialState: CommonState = {
    tokenSymbol: 'USDC',
    tokenDecimals: 6,
    tokenSymbolEth: 'MATIC',
    snackbarErrorMessage: null,
}

export const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        setSnackbarErrorMessage: (state, action) => {
            state.snackbarErrorMessage = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { 
    setSnackbarErrorMessage,
} = commonSlice.actions;

export default commonSlice.reducer;
