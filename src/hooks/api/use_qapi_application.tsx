import { logErrorOnBackend } from "../../utils/logger";

export function useQApiApplication() {
    async function submitNotificationDetails(nftId: bigint, emailAddress: string) {
        try {
            const response = await fetch('/api/application/notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "nft_id": nftId.toString(),
                    "contact_details": [
                        {
                            "type": "email",
                            "value": emailAddress,
                        }
                    ]
                }),
            });
            if (response.status !== 200) {
                throw new Error(`Error fetching notification details: ${response.statusText}`);
            }
            const contents = await response.json();
            if (contents.nft_id !== nftId.toString()) {
                throw new Error(`Invalid response. Expected nftId ${nftId}, received ${contents.nft_id}`);
            }
        } catch (error) {
            await logErrorOnBackend(`${error.message}`, error.toString(), 'POST /api/q/v1/application/notification');
            throw error;
        }
    }

    async function submitTransaction(transactionHash: string, nftId?: bigint) {
        try {
            const data = {
                "transaction_hash": transactionHash,
            };
            if (nftId) {
                data['nft_id'] = nftId.toString();
            }
            
            const response = await fetch('/api/application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.status !== 200) {
                throw new Error(`Error fetching notification details: ${response.statusText}`);
            }
        } catch (error) {
            await logErrorOnBackend(`${error.message}`, error.toString(), 'POST /api/q/v1/application/notification');
            throw error;
        }
    }

    return {
        submitNotificationDetails,
        submitTransaction,
    };
}
