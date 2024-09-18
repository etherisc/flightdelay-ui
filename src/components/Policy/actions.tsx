import { Box } from "@mui/material";

import Link from "next/link";
import { PolicyData, PolicyState } from "../../types/policy_data";
import { parseBigInt } from "../../utils/bigint";
import { PATH_MYPOLICIES, PATH_MYPOLICIES_TRANSFER_SUFFIX } from "../../utils/paths";
import Button from "../Button/button";
import Trans from "../Trans/trans";

export default function Actions({ policy } : { policy: PolicyData }) {
    const canTransfer = policy.state === PolicyState.ACTIVE;

    return (<Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-evenly',
            my: 1,
            }}>
        {/* will be reintroduced with issue #185 <Button color="primary" sx={{ width: '6rem' }} disabled={true}>
            <Trans k="action.renew" />
        </Button> */}

        { canTransfer && <Link href={`${PATH_MYPOLICIES}/${parseBigInt(policy.nftId)}${PATH_MYPOLICIES_TRANSFER_SUFFIX}`} passHref>
            <Button color="primary" sx={{ width: '6rem' }}>
                <Trans k="action.transfer" />
            </Button>
        </Link>}
        <Button color="primary" sx={{ width: '6rem' }} disabled={true}>
            <Trans k="action.claim" />
        </Button>
    </Box>);
}