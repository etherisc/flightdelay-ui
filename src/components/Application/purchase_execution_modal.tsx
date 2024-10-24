import { Modal, Box, CircularProgress, Alert } from "@mui/material";
import { grey } from "@mui/material/colors";
import { formatAmount } from "../../utils/amount";
import Trans from "../Trans/trans";
import { useEnvContext } from "next-runtime-env";

export default function PurchaseExecutionModal({ executingPurchase, executingSigning, premium } : { executingPurchase: boolean, executingSigning: boolean, premium: number | null }) {
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();

    if (! executingPurchase ) {
        return undefined;
    }

    return <Modal
        open={true}
        aria-labelledby="loading-modal-title"
        aria-describedby="loading-modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: grey[200] + `80` }}
    >
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: "white",
                opacity: '1.0 !important',
                boxShadow: 24,
                p: 4,
                borderRadius: 1,
                zIndex: 1000
            }}
        >
            <CircularProgress />
            <Box component="span" sx={{ mt: 2 }} maxWidth="md">
                { ! executingSigning && <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Trans k="purchasing" />
                </Box>}
                { executingSigning && <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Alert severity="info">
                        <Trans k="signing_request_1" />
                        <br />
                        <Trans k="signing_request_2" values={{ symbol: NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL, amount: formatAmount(BigInt(premium!), 6, 0)}} >
                            <b></b>
                        </Trans>
                    </Alert>
                </Box>}
            </Box>
        </Box>
    </Modal>;
}