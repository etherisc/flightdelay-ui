import { faPlaneCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, SvgIcon } from "@mui/material";
import { amber } from "@mui/material/colors";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import { resetFlightData } from "../../redux/slices/flightData";
import { resetPurchase } from "../../redux/slices/purchase";

export default function PurchaseSuccess() {
    const carrier = useSelector((state: RootState) => state.flightData.carrier);
    const flightNumber = useSelector((state: RootState) => state.flightData.flightNumber);
    const departureDate = useSelector((state: RootState) => state.flightData.departureDate);
    const policyNftId = useSelector((state: RootState) => state.purchase.policyNftId);
    const dispatch = useDispatch();

    function reset() {
        dispatch(resetPurchase());
        dispatch(resetFlightData());
    }

    return (<Box>
        <Alert 
            sx={{ mt: 2 }}
            icon={<SvgIcon sx={{ mr: 1 }}>
                    <FontAwesomeIcon icon={faPlaneCircleCheck} />
                </SvgIcon>}
            variant="filled" 
            severity="success">
            <Trans k="purchase_success" values={{ carrier, flightNumber, departureDate: dayjs(departureDate).format("YYYY-MM-DD"), policyNftId }} />
        </Alert>
        <Button sx={{ mt: 2 }} fullwidth color={amber[500]} onClick={reset}><Trans k="purchase_another" /></Button>
    </Box>);
}