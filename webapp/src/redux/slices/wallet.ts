import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { stringifyBigInt } from '../../utils/bigint';

export interface WalletState {
    isExpectedChain: boolean,
    connecting: boolean,
    address: string | null,
    balanceEth: string | null,
    balanceUsdc: string | null,
    isAccountSwitchListenerConnected: boolean,
}

const initialState: WalletState = {
    isExpectedChain: true,
    connecting: false,
    address: null,
    balanceEth: stringifyBigInt(BigInt(0)),
    balanceUsdc: stringifyBigInt(BigInt(0)),
    isAccountSwitchListenerConnected: false,
}

export const accountSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setExpectedChain(state, action: PayloadAction<boolean>) {
            state.isExpectedChain = action.payload;
        },
        setAddress(state, action: PayloadAction<string>) {
            state.address = action.payload;
        },
        setBalanceEth(state, action: PayloadAction<string>) {
            state.balanceEth = action.payload;
        },
        setBalanceUsdc(state, action: PayloadAction<string>) {
            state.balanceUsdc = action.payload;
        },
        setConnecting(state, action: PayloadAction<boolean>) {
            state.connecting = action.payload;
        },
        setAccountSwitchListenerConnected(state, action: PayloadAction<boolean>) {
            state.isAccountSwitchListenerConnected = action.payload;
        },
        resetAccount(state) {
            state.address = null;
            state.balanceUsdc = null;
        }
    },
});

// Action creators are generated for each case reducer function
export const { 
    setExpectedChain,
    setConnecting,
    setAddress,
    setBalanceEth, 
    setBalanceUsdc,
    setAccountSwitchListenerConnected,
    resetAccount,
} = accountSlice.actions;

export default accountSlice.reducer;
