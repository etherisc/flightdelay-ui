'use client';

import { useEnvContext } from "next-runtime-env";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import InvalidChain from "../../components/InvalidChain/invalid_chain";
import { useAnalytics } from "../../hooks/use_analytics";
import { RootState } from "../../redux/store";
import Application from "../../components/Application/application";



export function Content() {
    // const dispatch = useDispatch();
    const { trackPageView } = useAnalytics();
    const isExpectedChain = useSelector((state: RootState) => (state.wallet.isExpectedChain));
    const { NEXT_PUBLIC_EXPECTED_CHAIN_ID, NEXT_PUBLIC_EXPECTED_CHAIN_NAME } = useEnvContext();
    
    useEffect(() => {
        trackPageView("application", "/application");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (! isExpectedChain) {
        if (NEXT_PUBLIC_EXPECTED_CHAIN_ID !== undefined && NEXT_PUBLIC_EXPECTED_CHAIN_NAME !== undefined) {
            return (<InvalidChain />);
        }
    }

    return (<>
        <Application />
    </>);   
}