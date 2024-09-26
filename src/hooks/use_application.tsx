import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useTranslation } from "react-i18next";

export default function useApplication() {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const departureAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const isDepartureAirportWhiteListed = useSelector((state: RootState) => state.flightData.departureAirport?.whitelisted || true);
    const isArrivalAirportWhiteListed = useSelector((state: RootState) => state.flightData.arrivalAirport?.whitelisted || true);
    
    async function purchaseProtection() {
        setError(null);
        // do nothing, just log for now

        const canPurchase = departureAirport !== null && isDepartureAirportWhiteListed && isArrivalAirportWhiteListed;

        if (!canPurchase) {
            setError(t("error.purchase_protection_not_possible"));
            return;
        }

        console.log("purchaseProtection");
    }

    return {
        purchaseProtection,
        purchaseProtectionError: error,
    }
}
