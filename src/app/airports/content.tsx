'use client';

import { useEffect } from "react";
import { useWallet } from "../../hooks/onchain/use_wallet";
import { useAnalytics } from "../../hooks/use_analytics";
import Airports from "../../components/Airports/airports";



export function Content() {
    // const dispatch = useDispatch();
    const { trackPageView } = useAnalytics();
    const { reconnectWallet } = useWallet();
    
    useEffect(() => {
        reconnectWallet();
        trackPageView("airports", "/airports");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<>
        <Airports />
    </>);   
}