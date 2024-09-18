'use client';

import { useEffect } from "react";
import { useAnalytics } from "../../../hooks/use_analytics";
import Content from "./content";

export default function Page({ 
    params
} : {
    params: {
        nftId: number
    }
}) {
    const { trackPageView } = useAnalytics();

    useEffect(() => {
        trackPageView("mypolicies - nft policy", "/mypolicies/[nftId]");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const nftId = BigInt(params.nftId);
    console.log("nftId", nftId);
    return (<Content nftId={nftId} />);
}
