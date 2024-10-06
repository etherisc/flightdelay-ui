import { ApplicationData, PermitData } from "../../types/purchase_request";
import { PurchaseFailedError, PurchaseNotPossibleError } from "../../utils/error";

// @ts-expect-error BigInt is not defined in the global scope
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

export function useLocalApi() {

    async function sendPurchaseProtectionRequest(permit: PermitData, application: ApplicationData): Promise<{ riskId: string, policyNftId: string }> {
        console.log("purchasing protection api call");
        const uri = `/api/purchase`;
        const res = await fetch(uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({permit, application})
        });
        
        if (! res.ok) {
            const result = await res.json();
            if (result.error === "TX_FAILED") {
                throw new PurchaseFailedError(result.transaction, result.decodedError);
            } else if (result.error === "BALANCE_ERROR") {
                throw new PurchaseNotPossibleError();
            } else {
                throw new Error(`Error sending purchase protection request: ${result.statusText}`);
            }   
        } 

        console.log("purchase protection response", res);

        return await res.json();
    }

    return {
        sendPurchaseProtectionRequest,
    }
}