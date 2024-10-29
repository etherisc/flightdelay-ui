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

export const EVENT_PURCHASE = "purchase";
export const EVENT_BEGIN_CHECKOUT = "begin_checkout";
export const EVENT_SIGNUP_AMOUNT_BELOW_LOWER_LIMIT = "signup_amount_below_lower_limit";
export const EVENT_SIGNUP_AMOUNT_ABOVE_UPPER_LIMIT = "signup_amount_above_upper_limit";
export const EVENT_SIGNUP_GEOLOCATE_BROWSER = "signup_geolocate_browser";
export const EVENT_SIGNUP_GEOLOCATE_BROWSER_NOT_SUPPORTED = "signup_geolocate_browser_not_supported";
export const EVENT_SIGNUP_LOCATION_SELECTION_HINT_DISPLAYED = "signup_location_selection_hint_displayed";
export const EVENT_SIGNUP_NO_TYPE_SELECTED = "signup_no_type_selected";
export const EVENT_CONNECT_WALLET = "connect_wallet";
export const EVENT_DISCONNECT_WALLET = "disconnect_wallet";
export const EVENT_CONNECT_WALLET_NO_WALLET = "connect_wallet_no_wallet";
export const EVENT_CHECKOUT_INSUFFICIENT_BALANCE = "checkout_insufficient_balance";
export const EVENT_CHECKOUT_DISCOUNT_CODE_INVALID = "checkout_discount_code_invalid";
export const EVENT_CHECKOUT_DISCOUNT_CODE_APPLIED = "checkout_discount_code_applied";
export const EVENT_TRANSFER_NFT_SEND = "transfer_nft_send";
export const EVENT_TRANSFER_NFT_ABORT = "transfer_nft_abort";

export const EVENT_ERC20_APPROVAL_START = "erc20_approval_start";
export const EVENT_ERC20_APPROVAL_SUCCESS = "erc20_approval_success";
export const EVENT_ERC20_APPROVAL_FAIL = "erc20_approval_fail";
export const EVENT_ERC20_APPROVAL_EXISTS = "erc20_approval_exists";
export const EVENT_APPLICATION_TX_START = "application_tx_start";
export const EVENT_APPLICATION_TX_SUCCESS = "application_tx_success";
export const EVENT_APPLICATION_TX_FAIL = "application_tx_fail";
export const EVENT_TRANSFER_NFT_TX_START = "transfer_tx_start";
export const EVENT_TRANSFER_NFT_TX_SUCCESS = "transfer_tx_success";
export const EVENT_TRANSFER_NFT_TX_FAIL = "transfer_tx_fail";
