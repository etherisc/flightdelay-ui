import { useEnvContext } from "next-runtime-env";
import { event } from "nextjs-google-analytics";

type EventOptions = Record<string, unknown> & {
    category?: string;
    label?: string;
    value?: number;
    nonInteraction?: boolean;
    userId?: string;
};

export function useAnalytics() {
    const { NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_GA_ENVIRONMENT_ID } = useEnvContext();
    
    function trackEvent(eventName: string, options: EventOptions = {}) {
        console.log("trackEvent", eventName, options);
        if ( NEXT_PUBLIC_GA_MEASUREMENT_ID === undefined) { 
            return;
        }
        if ( NEXT_PUBLIC_GA_ENVIRONMENT_ID !== undefined && NEXT_PUBLIC_GA_ENVIRONMENT_ID !== "") {
            options.environment = NEXT_PUBLIC_GA_ENVIRONMENT_ID;
        }
        // console.log("trackEvent2", eventName, options);
        event(eventName, options);
    }

    function trackPageView(title: string, path: string, options: EventOptions = {}) {
        console.log("trackPageView", title, path, options);
        const opts = {
            page_title: title,
            page_path: path,
            environment: NEXT_PUBLIC_GA_ENVIRONMENT_ID || null,
            ...options,
        };
        
        trackEvent("page_view", opts);
    }
    
    return {
        trackEvent,
        trackPageView,
    }
}

export const EVENT_INVALID_CHAIN = "invalid_chain";
export const EVENT_RISKPOOL_FULL = "riskpool_full";
export const EVENT_BLACKLISTED_DEPARTURE_AIRPORT = "blacklisted_departure_airport";
export const EVENT_BLACKLISTED_ARRIVAL_AIRPORT = "blacklisted_arrival_airport";
export const EVENT_NON_WHITELISTED_AIRPORT = "non_whitelisted_airport";
export const EVENT_API_ERROR = "api_error";
export const EVENT_PURCHASE_NOT_POSSIBLE = "purchase_not_possible";
export const EVENT_INSUFFICIENT_BALANCE = "insufficient_balance";
export const EVENT_PERMIT_SIGNED = "permit_signed";
export const EVENT_USER_REJECTED = "user_rejected";
export const EVENT_PURCHASE_FAILED_UNKNOWN_ERROR = "purchase_failed_unknown_error";
export const EVENT_PURACHASE_SUCCESSFUL = "purchase_successful";
export const EVENT_QUOTE_NOT_ENOUGH_DATA = "quote_not_enough_data";
export const EVENT_QUOTE_POOL_CAPACITY_EXCEEDED = "quote_pool_capacity_exceeded";
export const EVENT_NO_FLIGHT_FOUND = "no_flight_found";
export const EVENT_PURCHASE_STARTED = "purchase_started";
export const EVENT_FETCH_FLIGHT_DATA = "fetch_flight_data";
