import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function Address() {
    const address = useSelector((state: RootState) => (state.wallet.address));
    
    if (address === null || address.length !== 42) {
        return (<></>);
    }
    
    return (<>{address.substring(0, 6)}…{address.substring(38, 42)}</>);
}
