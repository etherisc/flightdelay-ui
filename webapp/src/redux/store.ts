import { combineReducers, configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/wallet';
import signupReducer from './slices/signup';
import applicationReducer from './slices/application';
import myPoliciesReducer from './slices/mypolicies';
import commonReducer from './slices/common';

// Create the root reducer separately so we can extract the RootState type
const rootReducer = combineReducers({
    common: commonReducer,
    wallet: walletReducer,
    signup: signupReducer,
    application: applicationReducer,
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
