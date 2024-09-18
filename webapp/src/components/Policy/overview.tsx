import { Box, Typography } from "@mui/material";
import { NameValueBox, Trans } from "component-lib";
import { PRIMARY_BLUE } from "../../config/theme";
import { PolicyData } from "../../types/policy_data";
import { formatAmount } from "../../utils/amount";
import { parseBigInt } from "../../utils/bigint";
import { formatDate } from "../../utils/date";

export default function Overview({ policy, symbol } : { policy: PolicyData, symbol: string }) {
    const nftId = parseBigInt(policy.nftId);
    const sumInsured = parseBigInt(policy.sumInsured);
    const claimed = parseBigInt(policy.claimedAmount);
    const premium = parseBigInt(policy.premium);
    const createdAt = policy.createdAt;
    const expirationAt = policy.expirationAt;
    return (<Box sx={{ 
            p: 2,
            display: 'flex', 
            flexDirection: 'column', 
            }}> 

        <Typography 
            variant="h1" 
            color="primary" 
            sx={{ 
                borderBottom: '2px solid', 
                borderColor: PRIMARY_BLUE + "44",
                pb: 1,
                mb: 1,
            }}>
            <Trans k="mypolicies.details.overview" />
        </Typography>
        <NameValueBox name={<Trans k="nft_id" />} value={nftId.toString()} sx={{ py: 0, px: 1 }} data-testid="nftid" />
        <NameValueBox name={<Trans k="amount" />} value={`${symbol} ${formatAmount(sumInsured)}`} sx={{ py: 0, px: 1 }} data-testid="sum-insured" />
        <NameValueBox name={<Trans k="claimedAmount" />} value={`${symbol} ${formatAmount(claimed)}`} sx={{ py: 0, px: 1 }} data-testid="claimed" />
        <NameValueBox name={<Trans k="premium" />} value={`${symbol} ${formatAmount(premium)}`} sx={{ py: 0, px: 1 }} data-testid="premium" />
        <NameValueBox name={<Trans k="active_since" />} value={formatDate(createdAt)} sx={{ py: 0, px: 1 }} data-testid="created" />
        <NameValueBox name={<Trans k="expires_on" />} value={formatDate(expirationAt)} sx={{ py: 0, px: 1 }} data-testid="expires" />
    </Box>);
}