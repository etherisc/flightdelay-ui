import React, { PropsWithChildren } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { AppStore, RootState, setupStore } from '../../src/redux/store'
import { PublicEnvProvider } from 'next-runtime-env'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { AppRouterContextProviderMock } from './app-router-context-provider-mock'


// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
    preloadedState?: RootState
    store?: AppStore
}

export const UNDEFINED_ROOT_STATE: RootState = {
    // @ts-expect-error sadf
    common: undefined,
    // @ts-expect-error sadf
    wallet: undefined,
    // @ts-expect-error sadf
    flightData: undefined,
    // @ts-expect-error sadf
    policies: undefined
};

export function renderWithProviders(
    ui: React.ReactElement,
    {
        preloadedState = UNDEFINED_ROOT_STATE,
        // Automatically create a store instance if no store was passed in
        store = setupStore(preloadedState),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
        return (
            <Provider store={store}>
                <PublicEnvProvider>
                    {children}
                </PublicEnvProvider>
            </Provider>
        );
    }
    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export function renderWithProvidersAndDispatchMock(
    ui: React.ReactElement,
    {
        preloadedState = {
            // @ts-expect-error sadf
            common: undefined,
            // @ts-expect-error sadf
            wallet: undefined,
            // @ts-expect-error sadf
            flightData: undefined,
            // @ts-expect-error sadf
            policies: undefined
        },
        // Automatically create a store instance if no store was passed in
        store = setupStore(preloadedState),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
        const dispatchMock = jest.fn();
        store.dispatch = dispatchMock;
        return (
            <Provider store={store}>
                {children}
            </Provider>
        );
    }
    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export function withRouterAndEnvProviderWrapper(router: Partial<AppRouterInstance>) {
    return { wrapper: ({ children }: { children: React.ReactNode }) => 
        <AppRouterContextProviderMock router={router}>
            <PublicEnvProvider>
                {children}
            </PublicEnvProvider> 
        </AppRouterContextProviderMock>
    };
}