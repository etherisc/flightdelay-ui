import { Card, CardContent, CardHeader } from "@mui/material";
import { t } from "i18next";
import { PolicyData } from "../../types/policy_data";
import PolicyDetails from "./policy_details";

export function Policy({ policy } : { policy: PolicyData }) {
    
    return <Card sx={{ p: 2}}>
        <CardHeader title={t('policy_title', { ns: 'common', policyId: policy.nftId})} />
        <CardContent>
            <PolicyDetails
                departureAirport={{ name: "TODO", iata: policy?.flightPlan?.arrivalAirportFsCode || "", whitelisted: true }}
                arrivalAirport={{ name: "TODO", iata: policy?.flightPlan?.departureAirportFsCode || "", whitelisted: true }}
                departureTime={policy?.flightPlan?.departureTimeLocal || ""}
                arrivalTime={policy?.flightPlan?.arrivalTimeLocal || ""}
                ontimepercent={-1}
                premium={1}
                carrier={policy?.carrier || ""}
                payoutAmounts={{ delayed: BigInt(1), cancelled: BigInt(1), diverted: BigInt(1) }}
                flightNumber={policy?.flightNumber || ""}
                flightState={policy?.flightPlan?.status || "S"}
                delay={policy?.flightPlan?.delay || 0}
                />
        </CardContent>
    </Card>;
}