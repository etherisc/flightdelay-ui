import { Box, LinearProgress } from "@mui/material";
import { PolicyData, PolicyState } from "../../types/policy_data";
import PolicyShort from "./policy_short";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function PoliciesList({ policies, loading }: { policies: PolicyData[], loading: boolean }) {
    const symbol = useSelector((state: RootState) => (state.common.tokenSymbol));

    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }
    return (<Box data-testid="policies">
        {loadingIndicator}
        {policies.toSorted(policySorter).map((policy: PolicyData) => {
            return (<PolicyShort key={`policy-${policy.nftId}`} policy={policy} symbol={symbol} />);
        })}
    </Box>);
}

function policySorter(a: PolicyData, b: PolicyData) {
    const order = [
        PolicyState.APPLIED,
        PolicyState.UNDERWRITTEN,
        PolicyState.ACTIVE,
        PolicyState.CONFIRMED,
        PolicyState.EXPECTED,
        PolicyState.PAUSED,
        PolicyState.ARCHIVED,
        PolicyState.PAID,
        PolicyState.CLOSED,
        PolicyState.REVOKED,
        PolicyState.DECLINED,
    ];
    
    // first sort by state
    const aIndex = order.indexOf(a.state);
    const bIndex = order.indexOf(b.state);
    if (aIndex < bIndex) {
        return -1;
    } else if (aIndex > bIndex) {
        return 1;
    } 
    
    // then sort by creation date
    const aCreatedAt = a.createdAt;
    const bCreatedAt = b.createdAt;
    if (aCreatedAt < bCreatedAt) {
        return -1;
    } else if (aCreatedAt > bCreatedAt) {
        return 1;
    } else {
        return 0;
    }
}
