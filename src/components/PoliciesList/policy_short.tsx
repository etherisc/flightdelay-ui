import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@mui/material";

import { useRouter } from "next/navigation";
import Card from "../(basic_widgets)/Card/card";
import { BLUE_LIGHT } from "../../config/theme";
import { PolicyData } from "../../types/policy_data";
import { formatAmount } from "../../utils/amount";
import { parseBigInt } from "../../utils/bigint";
import { getIcon } from "../../utils/icons";
import { PATH_MYPOLICIES } from "../../utils/paths";
import PolicyCardHeader from "../PolicyCardHeader/policy_card_header";
import NameValueBox from "../NameValueBox/name_value_box";
import Trans from "../Trans/trans";
import Button from "../Button/button";

export default function PolicyShort({ policy, symbol }: { policy: PolicyData, symbol: string }) {
    const router = useRouter();
    
    const { type, nftId: nftIdb, sumInsured: sumInsuredB, locationName } = policy;
    const nftId = parseBigInt(nftIdb) || BigInt(0);
    const sumInsured = parseBigInt(sumInsuredB);

    return (<Card 
        variant="outlined"
        sx={{ backgroundColor: BLUE_LIGHT, mb: 2 }}
        sxContent={{ display: 'flex', flexDirection: 'column', gap: 0.25, p: 0, }} 
        data-testid={`policy-${policy.nftId}`}>
        <PolicyCardHeader policy={policy} />
        <NameValueBox name={<Trans k="nft_id" />} value={nftId.toString()} sx={{ py: 0 }} />
        <NameValueBox name={<Trans k="location" />} value={locationName} sx={{ py: 0 }} />
        <NameValueBox name={<Trans k="amount" />} value={`${symbol} ${formatAmount(sumInsured)}`} sx={{ py: 0 }} />
        <NameValueBox 
            name={
                <Typography color="primary" sx={{ m: 1 }}><FontAwesomeIcon icon={getIcon(type)} size="3x" /></Typography>
            } 
            value={
                <Button sx={{ px: 3 }} onClick={() => router.push(`${PATH_MYPOLICIES}/${nftId}`)}><Trans k="action.details" /></Button>
            } 
            sx={{ py: 0, alignItems: 'center' }} 
            noColon={true} 
            />
    </Card>);
}

