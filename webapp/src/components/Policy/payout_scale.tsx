import { Box, Typography } from "@mui/material";
import { NameValueBox, Trans } from "component-lib";
import { PRIMARY_BLUE } from "../../config/theme";
import { PolicyData, PolicyDataScaleEntry } from "../../types/policy_data";
import { formatAmount } from "../../utils/amount";
import { parseBigInt } from "../../utils/bigint";

export default function PayoutScale({ policy, symbol } : { policy: PolicyData, symbol: string }) {
    return (<Box sx={{ 
        p: 2,
        display: 'flex', 
        flexDirection: 'column', 
        }}
        data-testid="payout-scale"
        > 
        <Typography 
            variant="h1" 
            color="primary" 
            sx={{ 
                borderBottom: '2px solid', 
                borderColor: PRIMARY_BLUE + "44",
                pb: 1,
                mb: 1,
            }}>
            <Trans k={`mypolicies.details.payout_scheme-${policy.type}`} />
        </Typography>
        { policy.payoutScale.map(({mmiLevel, payoutAmount}: PolicyDataScaleEntry, i) => {
            return <NameValueBox 
                        name={`MMI ${parseBigInt(mmiLevel)}+`} 
                        value={`${symbol} ${formatAmount(parseBigInt(payoutAmount))}`} 
                        noColon={true}
                        key={i} 
                        bgColor="white" 
                        sx={{ mb: 0.25, p: 1 }} 
                        />;
        })}
    </Box>)
}