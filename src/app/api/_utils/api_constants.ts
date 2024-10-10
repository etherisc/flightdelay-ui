export const FLIGHTSTATS_BASE_URL = process.env.FLIGHTSTATS_BASE_URL || 'https://api.flightstats.com/flex';

export const FLIGHTSTATS_APP_ID = process.env.FLIGHTSTATS_APP_ID || '123456789';
export const FLIGHTSTATS_APP_KEY = process.env.FLIGHTSTATS_APP_KEY || '123456789';

export const PREMIUM = process.env.PREMIUM || '15000000';
export const ORACLE_ARRIVAL_CHECK_DELAY_SECONDS = parseInt(process.env.ORACLE_ARRIVAL_CHECK_DELAY_SECONDS || '3600');

export const PRODUCT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS || '0x';
export const ORACLE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS || '0x';

export const GAS_LIMIT = process.env.GAS_LIMIT || '5000000';