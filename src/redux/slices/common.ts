import { createSlice } from '@reduxjs/toolkit';

export interface CommonState {
    snackbarErrorMessage: string | null,
}

const initialState: CommonState = {
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
