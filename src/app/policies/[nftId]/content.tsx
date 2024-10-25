'use client';

import { Card, CardContent, CardHeader } from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useWallet } from "../../../hooks/onchain/use_wallet";
import { useAnalytics } from "../../../hooks/use_analytics";
import { useMyPolicies } from "../../../hooks/use_mypolicies";
import { RootState } from "../../../redux/store";
import FlightData from "../../../components/Application/flight_data";


export default function Content({ nftId } : { nftId: string }) {
    console.log("nftId", nftId);
    const { reconnectWallet } = useWallet();
    const { t } = useTranslation();
    // const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const { trackPageView } = useAnalytics();

    const address = useSelector((state: RootState) => (state.wallet.address));
    const policy = useSelector((state: RootState) => state.policy.policy);
    const loading = useSelector((state: RootState) => state.policy.loadingPolicy);

    const { fetchPolicy } = useMyPolicies();
    
    useEffect(() => {
        if (address === null) {
            reconnectWallet();
        }
        trackPageView("policy", "/policies/" + nftId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch policies when address changes
    useEffect(() => {
        if (address !== null && !loading) {
            fetchPolicy(nftId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]); 

    return (<Card>
        {/* TODO: add policy id to header */}
        <CardHeader title={t('policy', { ns: 'common'})} />
        <CardContent>
            <FlightData 
                departureAirport={{ name: "TODO", iata: policy?.flightPlan?.arrivalAirportFsCode || "", whitelisted: true }}
                arrivalAirport={{ name: "TODO", iata: policy?.flightPlan?.departureAirportFsCode || "", whitelisted: true }}
                departureTime={policy?.flightPlan?.departureTimeLocal || ""}
                arrivalTime={policy?.flightPlan?.arrivalTimeLocal || ""}
                ontimepercent={-1}
                premium={1}
                carrier={policy?.carrier || ""}
                payoutAmounts={{ delayed: BigInt(1), cancelled: BigInt(1), diverted: BigInt(1) }}
                flightNumber={policy?.flightNumber || ""}
                />
        </CardContent>
    </Card>);   
}

