import { ApplicationData, PermitData } from "../../types/purchase_request";

// @ts-expect-error BigInt is not defined in the global scope
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

export function useLocalApi() {

    async function sendPurchaseProtectionRequest(permit: PermitData, application: ApplicationData): Promise<void> {
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
            throw new Error(`Error fetching quote data: ${res.statusText}`);
        }

        return await res.json();
    }

    return {
        sendPurchaseProtectionRequest,
    }
}
