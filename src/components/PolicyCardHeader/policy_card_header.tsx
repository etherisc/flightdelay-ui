import { Box, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { PolicyData, PolicyState } from "../../types/policy_data";
import { formatDate } from "../../utils/date";
import Trans from "../Trans/trans";

export default function PolicyCardHeader({ policy, sx } : { policy: PolicyData, sx?: SxProps<Theme>}) {
    let backgroundColor = undefined;
    let context = <Trans k={`policy_state.${PolicyState[policy.state]}`} />;
    let contextColor = grey[700].toString();
    const theme = useTheme();

    switch (policy.state) {
        case PolicyState.APPLIED:
            backgroundColor = undefined;
            break;
        case PolicyState.ARCHIVED:
        case PolicyState.CLOSED:
            context = <><Trans k="policy_state.CLOSED" /></>;
            break;
        case PolicyState.REVOKED:
            context = <><Trans k="policy_state.REVOKED" /></>;
            break;

        case PolicyState.DECLINED:
            backgroundColor = undefined;
            context = <><Trans k="policy_state.DECLINED" /></>
            break;

        case PolicyState.UNDERWRITTEN:
        default:
            backgroundColor = '#fff';
            context = <><Trans k="mypolicies.expires" /> {formatDate(policy.expirationAt)}</>
            contextColor = theme.palette.text.primary;
            break;
    }

    return (<Box sx={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        p: 1.5,
        px: 2,
        mb: 1,
        backgroundColor,
        ...sx,
        }}>
        <Typography color="primary" variant="h2" sx={{ flexGrow: 0 }}>
            <Trans k={`protection_type_names.${policy.type}`} />
        </Typography>
        <Typography color={contextColor} variant="h3" sx={{ ml: 2, flexGrow: 1, textAlign: 'right' }} data-testid="state">
            {context}
        </Typography>
    </Box>);
}
