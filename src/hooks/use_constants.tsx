import { useEnvContext } from "next-runtime-env";


export function useConstants() {
    const { NEXT_PUBLIC_DEPARTURE_DATE_DAYS_MIN, NEXT_PUBLIC_DEPARTURE_DATE_DAYS_MAX } = useEnvContext();

    const DEPARTURE_DATE_DAYS_MIN = parseInt(NEXT_PUBLIC_DEPARTURE_DATE_DAYS_MIN || '7');
    const DEPARTURE_DATE_DAYS_MAX = parseInt(NEXT_PUBLIC_DEPARTURE_DATE_DAYS_MAX || '60');

    return {
        DEPARTURE_DATE_DAYS_MIN,
        DEPARTURE_DATE_DAYS_MAX,
    }
}
