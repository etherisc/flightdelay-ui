import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import { Button, NameValueBox, Trans } from "component-lib";
import Link from "next/link";
import Card from "../(basic_widgets)/Card/card";
import Date from "../(basic_widgets)/Date/date";
import { BLUE_LIGHT } from "../../config/theme";
import { parseBigInt } from "../../utils/bigint";
import { getIcon } from "../../utils/icons";
import { ApplicationData } from "../../redux/slices/application";
import NotifyMeForm from "./notify_me_form";
import { PATH_MYPOLICIES } from "../../utils/paths";

export function CheckoutSuccess({ applicationData, symbol } : { applicationData: ApplicationData, symbol: string }) {
    const theme = useTheme();

    // extrat application data from redux store and reset to show only once. 
    const locationName = applicationData?.locationName;
    const endDate = applicationData?.endDate;
    const sumInsured = applicationData?.sumInsured;
    const coverageType = applicationData?.type;
    const finalPremium = applicationData?.finalPremium;
    const nftId = applicationData?.nftId;

    if (nftId === null) {
        return <></>;
    }
    
    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column'}}>
            {/* <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                <Typography color={theme.palette.primary.main} variant="h2" sx={{ ml: 2 }}>
                    <Trans k="checkout_success.title" />
                </Typography>
            </Box> */}

            <Alert severity="success" sx={{ mb: 2 }} data-testid="alert-success">
                <AlertTitle><Trans k="checkout_success.success"/></AlertTitle>
                <Trans k="checkout_success.bought" values={{ amount: `${symbol} ${finalPremium}` }} />
            </Alert>

            <Card 
                variant="outlined"
                sx={{ backgroundColor: BLUE_LIGHT, mb: 2, overflow: 'visible' }}
                sxContent={{ display: 'flex', flexDirection: 'column', gap: 0.25 }} 
                data-testid="offer-values">
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography color={theme.palette.primary.main} variant="h2" sx={{ ml: 2, flexGrow: 0 }}>
                        <Trans k={`protection_type_names.${coverageType}`} />
                    </Typography>
                    <Typography color={grey[700]} variant="h3" sx={{ ml: 2, flexGrow: 1, textAlign: 'right' }}>
                        <Trans k="policy_state.APPLIED" />
                    </Typography>
                </Box>
                <NameValueBox name={<Trans k="nft_id" />} value={parseBigInt(nftId).toString()} sx={{ py: 0 }} />
                <NameValueBox name={<Trans k="location" />} value={locationName} sx={{ py: 0 }} />
                <NameValueBox name={<Trans k="policy_end_date" />} value={<Date timestamp={endDate} />} sx={{ py: 0 }} />
                <NameValueBox name={<Trans k="amount" />} value={`${symbol} ${sumInsured}`} sx={{ py: 0 }} />
                <NameValueBox 
                    name={
                        <Typography color="primary" sx={{ m: 1 }}>
                            <FontAwesomeIcon icon={getIcon(coverageType)} size="3x" />
                        </Typography>
                    } 
                    value={
                        <Link href={`${PATH_MYPOLICIES}/${parseBigInt(nftId)}`}>
                            <Button sx={{ px: 3 }}>
                                <Trans k="action.details" />
                            </Button>
                        </Link>
                    } 
                    sx={{ py: 0, alignItems: 'center' }} 
                    noColon={true} 
                    />
            </Card>

            <Box sx={{ px: 2 }}>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    <Trans k="checkout_success.thank_you" />
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    <Trans k="checkout_success.thank_you2" />
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }} data-testid="form-notifyme">
                    <NotifyMeForm nftId={parseBigInt(nftId)}/>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    <Trans k="checkout_success.thank_you3"/>
                </Typography>
            </Box>
        </Box>
    );
}