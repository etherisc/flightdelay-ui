import { Card, CardContent, CardHeader } from "@mui/material";
import { t } from "i18next";
import { PolicyData } from "../../types/policy_data";
import PolicyDetails from "./policy_details";

export function Policy({ policy } : { policy: PolicyData }) {
    const payoutAmounts = { delayed: BigInt(0), cancelled: BigInt(0), diverted: BigInt(0) };

    if ((policy.flightPlan?.status === 'S' || policy.flightPlan?.status === 'A') && policy.payoutAmounts) {
        payoutAmounts.delayed = BigInt(policy.payoutAmounts[0]);
        payoutAmounts.cancelled = BigInt(policy.payoutAmounts[1]);
        payoutAmounts.diverted = BigInt(policy.payoutAmounts[2]);
    } else if (policy.flightPlan?.status === 'L' && policy.payoutAmounts) {
        if (policy.flightPlan.delay > 45) {
            payoutAmounts.delayed = BigInt(policy.payoutAmounts[0]);
        }
    } else if (policy.flightPlan?.status === 'C' && policy.payoutAmounts) {
        payoutAmounts.cancelled = BigInt(policy.payoutAmounts[1]);
    } else if (policy.flightPlan?.status === 'D' && policy.payoutAmounts) {
        payoutAmounts.diverted = BigInt(policy.payoutAmounts[2]);
    }
    
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
                payoutAmounts={payoutAmounts}
                flightNumber={policy?.flightNumber || ""}
                flightState={policy?.flightPlan?.status || "S"}
                delay={policy?.flightPlan?.delay || 0}
                />
        </CardContent>
    </Card>;
}