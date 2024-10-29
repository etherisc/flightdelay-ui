import { event } from "nextjs-google-analytics";

type EventOptions = Record<string, unknown> & {
    category?: string;
    label?: string;
    value?: number;
    nonInteraction?: boolean;
    userId?: string;
};

export function useAnalytics() {
    const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const envId = process.env.NEXT_PUBLIC_GA_ENVIRONMENT_ID;

    function trackEvent(eventName: string, options: EventOptions = {}) {
        if ( gaMeasurementId === undefined) { 
            return;
        }
        if ( envId !== undefined && envId !== "") {
            options.environment = envId;
        }
        event(eventName, options);
    }

    function trackPageView(title: string, path: string, options: EventOptions = {}) {
        const opts = {
            page_title: title,
            page_path: path,
            environment: envId || null,
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
