import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { stringifyBigInt } from '../../utils/bigint';

export interface WalletState {
    isConnected: boolean,
    isExpectedChain: boolean,
    connecting: boolean,
    address: string | null,
    balanceEth: string,
    balanceUsdc: string,
    isChainChangedListenerConnected: boolean,
    isAccountSwitchListenerConnected: boolean,
}

const initialState: WalletState = {
    isConnected: false,
    isExpectedChain: true,
    connecting: false,
    address: null,
    balanceEth: stringifyBigInt(BigInt(0)),
    balanceUsdc: stringifyBigInt(BigInt(0)),
    isChainChangedListenerConnected: false,
    isAccountSwitchListenerConnected: false,
}

export const accountSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setConnected(state, action: PayloadAction<boolean>) {
            state.isConnected = action.payload;
        },
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
        setChainChangedListenerConnected(state, action: PayloadAction<boolean>) {
            state.isChainChangedListenerConnected = action.payload;
        },
        setAccountSwitchListenerConnected(state, action: PayloadAction<boolean>) {
            state.isAccountSwitchListenerConnected = action.payload;
        },
        resetAccount(state) {
            state.isConnected = false;
            state.isExpectedChain = true;
            state.connecting = false;
            state.address = null;
            state.balanceEth = stringifyBigInt(BigInt(0));
            state.balanceUsdc = stringifyBigInt(BigInt(0));
            state.isAccountSwitchListenerConnected = false;
            state.isChainChangedListenerConnected = false;
        }
    },
});

// Action creators are generated for each case reducer function
export const { 
    setConnected,
    setExpectedChain,
    setConnecting,
    setAddress,
    setBalanceEth, 
    setBalanceUsdc,
    setAccountSwitchListenerConnected,
    setChainChangedListenerConnected,
    resetAccount,
} = accountSlice.actions;

export default accountSlice.reducer;
