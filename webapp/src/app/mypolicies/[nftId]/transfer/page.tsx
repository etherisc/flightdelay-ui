'use client';

import { useEffect } from "react";
import { useAnalytics } from "../../../../hooks/use_analytics";
import { PolicyTransferContent } from "./content";

export default function TransferPolicyPage({ 
    params
} : {
    params: {
        nftId: number
    }
}) {
    const { trackPageView } = useAnalytics();

    useEffect(() => {
        trackPageView("mypolicies - transfer policy", "/mypolicies/[nftId]/transfer");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const nftId = BigInt(params.nftId);
    console.log("nftId", nftId);
    return (<PolicyTransferContent nftId={nftId} />);
}
