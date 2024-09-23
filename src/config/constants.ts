export const DEPARTURE_AIRPORTS_WHITELIST = (process.env.NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST?.split(',') || []).map((x) => x.trim());
export const ARRIVAL_AIRPORTS_WHITELIST = (process.env.NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST?.split(',') || []).map((x) => x.trim());

export const DEPARTURE_DATE_DAYS_MIN = parseInt(process.env.NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS || '7');
export const DEPARTURE_DATE_DAYS_MAX = parseInt(process.env.NEXT_PUBLIC_DEPARTURE_DATE_MAX_DAYS || '60');
export const DEPARTURE_DATE_DATE_FROM = process.env.NEXT_PUBLIC_DEPARTURE_DATE_DATE_FROM || '';
export const DEPARTURE_DATE_DATE_TO = process.env.NEXT_PUBLIC_DEPARTURE_DATE_DATE_TO || '';
export const PREMIUM_TOKEN_SYMBOL = process.env.NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL || 'USDC';

