'use client';

import { useEffect } from "react";
import Application from "../../components/Application/application";
import { useWallet } from "../../hooks/onchain/use_wallet";
import { useAnalytics } from "../../hooks/use_analytics";



export function Content() {
    // const dispatch = useDispatch();
    const { trackPageView } = useAnalytics();
    const { reconnectWallet } = useWallet();
    
    useEffect(() => {
        reconnectWallet();
        trackPageView("apply", "/apply");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<>
        <Application />
    </>);   
}