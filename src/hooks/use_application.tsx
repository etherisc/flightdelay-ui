import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useTranslation } from "react-i18next";
import { useERC20Contract } from "./onchain/use_erc20_contract";
import { PREMIUM_TOKEN_DECIMALS } from "../config/constants";
import { useEnvContext } from "next-runtime-env";
import { useWallet } from "./onchain/use_wallet";

export default function useApplication() {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS } = useEnvContext();

    const { hasBalance } = useERC20Contract(NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS!, PREMIUM_TOKEN_DECIMALS);
    const { getSigner } = useWallet();
    
    const [error, setError] = useState<string | null>(null);
    const departureAirport = useSelector((state: RootState) => state.flightData.arrivalAirport);
    const isDepartureAirportWhiteListed = useSelector((state: RootState) => state.flightData.departureAirport?.whitelisted || true);
    const isArrivalAirportWhiteListed = useSelector((state: RootState) => state.flightData.arrivalAirport?.whitelisted || true);
    const premium = useSelector((state: RootState) => state.flightData.premium);
    
    async function purchaseProtection() {
        setError(null);
        // do nothing, just log for now

        const canPurchase = departureAirport !== null && isDepartureAirportWhiteListed && isArrivalAirportWhiteListed && premium !== null;

        if (!canPurchase) {
            setError(t("error.purchase_protection_not_possible"));
            return;
        }

        
        if (! await hasBalance(BigInt(premium!), (await getSigner())!)) {
            setError(t("error.insufficient_balance"));
            return;
        }

        console.log("purchaseProtection");

        // TODO: 1. check wallet balance for payment token
        // TODO: 2. Calculate erc20 permit signature 
        // TODO: 3. send all data relevant for tx to the backend
    }

    return {
        purchaseProtection,
        purchaseProtectionError: error,
    }
}
