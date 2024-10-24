import { Alert, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { resetFlightData } from "../../redux/slices/flightData";
import { resetPurchase } from "../../redux/slices/purchase";
import { RootState } from "../../redux/store";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import { useState } from "react";

export default function PurchaseSuccess({ purchaseSuccessful } : { purchaseSuccessful: boolean }) {
    const carrier = useSelector((state: RootState) => state.flightData.carrier);
    const flightNumber = useSelector((state: RootState) => state.flightData.flightNumber);
    const departureDate = useSelector((state: RootState) => state.flightData.departureDate);
    const policyNftId = useSelector((state: RootState) => state.purchase.policyNftId);
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(true);

    if ( ! purchaseSuccessful) {
        return undefined;
    }

    function reset() {
        dispatch(resetPurchase());
        dispatch(resetFlightData());
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
                <Button onClick={reset}><Trans k="action.continue" /></Button>
            </DialogActions>
        </Dialog>
    </>);
}