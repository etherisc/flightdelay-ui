'use client';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { useServerInsertedHTML } from 'next/navigation';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider, useDispatch, useSelector } from 'react-redux';
import i18n from '../../config/i18n';
import { DURATION_SNACKBAR_ERROR, ZINDEX_SNACKBAR, customTheme } from '../../config/theme';
import { RootState, store } from '../../redux/store';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import { Alert, Snackbar } from '@mui/material';
import { setSnackbarErrorMessage } from '../../redux/slices/common';

// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ThemeRegistry(props: { options: any, children: React.ReactNode }) {
    const { options, children } = props;

    const [{ cache, flush }] = React.useState(() => {
        const cache = createCache(options);
        cache.compat = true;
        const prevInsert = cache.insert;
        let inserted: string[] = [];
        cache.insert = (...args) => {
            const serialized = args[1];
            if (cache.inserted[serialized.name] === undefined) {
                inserted.push(serialized.name);
            }
            return prevInsert(...args);
        };
        const flush = () => {
            const prevInserted = inserted;
            inserted = [];
            return prevInserted;
        };
        return { cache, flush };
    });

    useServerInsertedHTML(() => {
        const names = flush();
        if (names.length === 0) {
            return null;
        }
        let styles = '';
        for (const name of names) {
            styles += cache.inserted[name];
        }
        // console.log("nonce", options.nonce, cache.nonce);
        return (
            <style
                key={cache.key}
                nonce={cache.nonce}
                data-emotion={`${cache.key} ${names.join(' ')}`}
                dangerouslySetInnerHTML={{
                    __html: styles,
                }}
            />
        );
    });

    return (
        <Provider store={store}>
            <GoogleAnalytics />
            <CacheProvider value={cache}>
                <I18nextProvider i18n={i18n} defaultNS={'common'}>
                    <ThemeProvider theme={customTheme}>
                        <CssBaseline enableColorScheme />
                        <ClientsideLayout>
                            {children}
                        </ClientsideLayout>
                    </ThemeProvider>
                </I18nextProvider>
            </CacheProvider>
        </Provider>
    );
}

export function ClientsideLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    const snackBarErrorMsg = useSelector((state: RootState) => (state.common.snackbarErrorMessage));
    const dispatch = useDispatch();

    return (
        <>
            {children}
            <Snackbar 
                open={snackBarErrorMsg !== null} 
                onClose={() => dispatch(setSnackbarErrorMessage(null))}
                autoHideDuration={DURATION_SNACKBAR_ERROR} 
                sx={{ zIndex: ZINDEX_SNACKBAR }}>
                <Alert severity="error" variant='filled' onClose={() => dispatch(setSnackbarErrorMessage(null))}>
                    {snackBarErrorMsg}
                </Alert>
            </Snackbar>
        </>
    );
}