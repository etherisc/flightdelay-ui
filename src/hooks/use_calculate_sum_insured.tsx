import { useEffect, useState } from "react";

export default function useCalculateSumInsured(premium: string, ratioFragileShield: number, ratioHomeGuard: number) {
    const [sumInsuredFragileShield, setSumInsuredFragileShield] = useState(parseInt(premium) * ratioFragileShield);
    const [sumInsuredHomeGuard, setSumInsuredHomeGuard] = useState(parseInt(premium) * ratioHomeGuard);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (premium.trim() === "" || isNaN(premium)) {
            setSumInsuredFragileShield(0);
            setSumInsuredHomeGuard(0);
            return;
        }

        setSumInsuredFragileShield(parseInt(premium) * ratioFragileShield);
        setSumInsuredHomeGuard(parseInt(premium) * ratioHomeGuard);
    }, [premium, ratioFragileShield, ratioHomeGuard]);

    return {
        sumInsuredFragileShield,
        sumInsuredHomeGuard,
    }
}
