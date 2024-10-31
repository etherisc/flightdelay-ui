import { Alert, Dialog, DialogActions, DialogContent } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Button from "../Button/button";
import Trans from "../Trans/trans";

export default function PurchaseSuccess({ purchaseSuccessful, resetForm } : { purchaseSuccessful: boolean, resetForm: () => void }) {
    const carrier = useSelector((state: RootState) => state.flightData.carrier);
    const flightNumber = useSelector((state: RootState) => state.flightData.flightNumber);
    const departureDate = useSelector((state: RootState) => state.flightData.departureDate);
    const policyNftId = useSelector((state: RootState) => state.purchase.policyNftId);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (policyNftId === null) {
            setVisible(true);
        }
    }, [policyNftId]);

    if ( ! purchaseSuccessful) {
        return undefined;
    }

    function reset() {
        resetForm();
        setVisible(false);
    }

    return (<>
        <Dialog
            open={visible}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md"
            >
            <DialogContent>
                <Alert 
                    sx={{ mt: 2, p: 4 }}
                    severity="success">
                    <Trans k="purchase_success" values={{ carrier, flightNumber, departureDate: dayjs(departureDate).format("YYYY-MM-DD"), policyNftId }}>
                        <strong>1</strong>
                        <br/>
                    </Trans>
                </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={reset} sx={{ px: 4, mr: 1 }}><Trans k="action.continue" /></Button>
            </DialogActions>
        </Dialog>
    </>);
}