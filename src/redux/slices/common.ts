import { createSlice } from '@reduxjs/toolkit';

export interface CommonState {
    snackbarErrorMessage: string | null,
    generalErrorMessage: string | null,
}

const initialState: CommonState = {
    snackbarErrorMessage: null,
    generalErrorMessage: null,
}

export const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        setSnackbarErrorMessage: (state, action) => {
            state.snackbarErrorMessage = action.payload;
        },
        setGeneralErrorMessage: (state, action) => {
            state.generalErrorMessage = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { 
    setGeneralErrorMessage,
    setSnackbarErrorMessage,
} = commonSlice.actions;

export default commonSlice.reducer;
