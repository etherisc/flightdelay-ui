import { Features } from "../types/features";

export function features() {
    return { 
        locationSearch: process.env.LOCATION_IQ_API_KEY !== undefined,
        geoLocationApi: process.env.IP_GEOLOCATION_API_KEY !== undefined,
        csp: process.env.CSP_ENABLED?.toLowerCase() === 'true',
    } as Features;
}
