import { combineReducers, configureStore } from '@reduxjs/toolkit';
import commonReducer from './slices/common';
import flightDataReducer from './slices/flightData';
import myPoliciesReducer from './slices/mypolicies';
import walletReducer from './slices/wallet';

// Create the root reducer separately so we can extract the RootState type
const rootReducer = combineReducers({
    common: commonReducer,
    wallet: walletReducer,
    flightData: flightDataReducer,
    myPolicies: myPoliciesReducer,
})

export const setupStore = (preloadedState?: RootState) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState
    })
}

export const store = setupStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch'];
