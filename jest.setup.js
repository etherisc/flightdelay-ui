// Polyfill TextEncoder/TextDecoder for Next.js 15 in Jest (jsdom lacks these)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next-runtime-env to avoid loading Next.js server stack (next/cache, etc.)
jest.mock('next-runtime-env', () => ({
    PublicEnvProvider: ({ children }) => children,
    useEnvContext: () => ({
        NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL: 'FUSD',
        NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
        NEXT_PUBLIC_FLIGHT_NFT_CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
        NEXT_PUBLIC_AIRPORTS_WHITELIST: '',
        NEXT_PUBLIC_AIRPORTS_BLACKLIST: '',
        NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM: undefined,
        NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS: '14',
    }),
}));
