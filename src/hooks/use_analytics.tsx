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

