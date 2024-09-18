import { Box, Typography } from "@mui/material";
import { BLUE_LIGHT, BLUE_LIGHT2 } from "../../config/theme";
import Card from "../(basic_widgets)/Card/card";
import Trans from "../Trans/trans";
import ReferralCodeForm from "./referral_code_form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { grey } from "@mui/material/colors";
import { faCircleXmark } from "@fortawesome/pro-regular-svg-icons";

export default function ReferralCode({
    referralCode,
    referralCodeDiscount,
    onApplyReferralCode,
}: {
    referralCode: string | null,
    referralCodeDiscount: number,
    onApplyReferralCode?: (referralCode: string) => Promise<void>,
}) {    
    let appliedCode = <></>;
    if (referralCode != null && referralCodeDiscount != null && referralCodeDiscount > 0) {
        appliedCode = (
            <Typography 
                variant="h4" 
                color="primary" 
                sx={{ 
                    mt: 1, 
                    px: 2, py: 1, 
                    backgroundColor: BLUE_LIGHT2, 
                    borderRadius: 2,
                }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignContent: 'baseline'}}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Trans k="checkout.referral_code_applied" values={{ pct: referralCodeDiscount * 100 }} />
                    </Box>
                    <Typography color={grey[600]} >
                        <FontAwesomeIcon icon={faCircleXmark} onClick={() => onApplyReferralCode('') }/>
                    </Typography>
                </Box>
            </Typography>);
    }

    return (
    <Box sx={{ flexGrow: 0, mt: 2, width: '100%' }}>
        <Card 
            elevation={0}
            sx={{ 
                backgroundColor: BLUE_LIGHT,
            }} 
            sxContent={{ 
                display: 'flex', 
                flexDirection: 'column', 
            }}>
                <Typography variant="h4" color="primary"><Trans k="referral_code"/>:</Typography>
                <ReferralCodeForm onApplyReferralCode={onApplyReferralCode} referralCode={referralCode} />
                {appliedCode}
        </Card>
    </Box>);
}