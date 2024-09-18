import Card from "../(basic_widgets)/Card/card";
import { BLUE_LIGHT } from "../../config/theme";
import { PolicyData } from "../../types/policy_data";
import PolicyCardHeader from "../PolicyCardHeader/policy_card_header";
import Actions from "./actions";
import Overview from "./overview";
import PayoutScale from "./payout_scale";
import Location from "./location";

export default function Policy({ policy, symbol }: { policy: PolicyData, symbol: string }) {
    return (<Card 
        variant="outlined"
        sx={{ backgroundColor: BLUE_LIGHT }}
        sxContent={{ display: 'flex', flexDirection: 'column', gap: 0.25, p: 0, }} 
        data-testid={`policy-${policy.nftId}`}>
        <PolicyCardHeader policy={policy} sx={{ mb: 0 }} />
        <Actions policy={policy} />
        <Overview policy={policy} symbol={symbol} />
        <Location policy={policy} />
        <PayoutScale policy={policy} symbol={symbol} />
    </Card>);
}
