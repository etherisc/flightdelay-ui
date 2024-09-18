import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import { Box, Container } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import type { Metadata } from 'next';
import React from 'react';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';
import TopBar from '../components/TopBar/topbar';
import './layout.css';
import { PublicEnvProvider } from 'next-runtime-env';
import BottomNav from '../components/BottomNav/bottom_nav';
import { headers } from 'next/headers';
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from "@fortawesome/fontawesome-svg-core"; 

config.autoAddCss = false;

export const metadata: Metadata = {
    title: 'Flightdelay',
    description: 'Flight delay insurance for everyone',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const nonce = headers().get('X-Nonce');
    // console.log('nonce', nnnonce);
    
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
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

function AppBaseLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Container maxWidth="sm" sx={{ p: 2, py: 1 }}>
                <TopBar />
            </Container>
            <Container maxWidth="sm" sx={{ p: 0, top: 0, bottom: 0, height: '100%', overflow: 'scroll' }}>
                {children}
            </Container>
            <BottomNav />
        </Box>
    )
}
