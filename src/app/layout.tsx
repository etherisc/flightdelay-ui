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
    title: 'Etherisc Flight Delay Protection',
    description: 'Experience the future of travel protection with our blockchain-powered flight delay insurance. Enjoy transparent, secure, and automated claims processing, ensuring you get compensated swiftly and fairly for any flight disruptions. Trust in the power of blockchain to safeguard your journeys!',
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

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://flightdelay.app/" />
                <meta property="og:title" content="Etherisc Flight Delay Protection" />
                <meta property="og:description" content="Experience the future of travel protection with our blockchain-powered flight delay insurance. Enjoy transparent, secure, and automated claims processing, ensuring you get compensated swiftly and fairly for any flight disruptions. Trust in the power of blockchain to safeguard your journeys!" />
                <meta property="og:image" content="https://flightdelay.app/assets/images/etherisc_logo_bird_blue.svg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://flightdelay.app/" />
                <meta property="twitter:title" content="Etherisc Flight Delay Protection" />
                <meta property="twitter:description" content="Experience the future of travel protection with our blockchain-powered flight delay insurance. Enjoy transparent, secure, and automated claims processing, ensuring you get compensated swiftly and fairly for any flight disruptions. Trust in the power of blockchain to safeguard your journeys!" />
                <meta property="twitter:image" content="https://flightdelay.app/assets/images/etherisc_logo_bird_blue.svg" />

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

