import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import { config } from "@fortawesome/fontawesome-svg-core";
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { Metadata } from 'next';
import { PublicEnvProvider } from 'next-runtime-env';
import { headers } from 'next/headers';
import React from 'react';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import { AppBaseLayout } from './app_base_layout';
import './layout.css';

config.autoAddCss = false;

export const metadata: Metadata = {
    title: 'Flightdelay',
    description: 'Flight delay insurance for everyone',
}

export default async function RootLayout(
    {
        children,
    }: {
        children: React.ReactNode
    }
) {
    const nonce = (await headers()).get('X-Nonce');
    // console.log('nonce', nnnonce);
    
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <meta charSet="utf-8" />
                <link rel="icon" href="/favicon.svg" />
            </head>
            <body>
                <PublicEnvProvider>
                    <ThemeRegistry options={{ key: 'mui', nonce: nonce }}>
                        <AppBaseLayout>
                            {children}
                        </AppBaseLayout>
                    </ThemeRegistry>
                </PublicEnvProvider>
            </body>
        </html>
    )
}

