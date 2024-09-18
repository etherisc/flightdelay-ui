import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, FormControlLabel, Radio, Typography } from "@mui/material";
import { useRadioGroup } from "@mui/material/RadioGroup";
import { useTheme } from '@mui/material/styles';
import { NameValueBox, Trans } from "component-lib";
import { Control, Controller } from "react-hook-form";
import Card from "../(basic_widgets)/Card/card";
import { BLUE_LIGHT } from "../../config/theme";
import { CoverageTypeDetails, PayoutSchemeEntry } from "../../redux/slices/signup";
import { formatAmountNum } from "../../utils/amount";
import { getIcon } from "../../utils/icons";
import { ICoverageTypeFormValues } from "./select_coverage_type";

interface CoverageTypeBoxProps {
    symbol: string;
    details: CoverageTypeDetails;
    control: Control<ICoverageTypeFormValues, unknown>; 
    onClick: () => void;
}

export default function CoverageTypeBox(props: CoverageTypeBoxProps) {
    const theme = useTheme();
    const radioGroup = useRadioGroup();
    const isSelected = radioGroup.value === props.details.type;
    const { type, payoutScheme } = props.details;
    
    return (<Card 
                variant="outlined"
                sx={{ 
                    mb: 2, 
                    backgroundColor: BLUE_LIGHT,
                    border: (isSelected ? `1px solid ${theme.palette.primary.main}` : `1px solid ${BLUE_LIGHT}`),
                }} 
                sxContent={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                }}
                data-testid={"coverage-type-" + type}
                onCardClicked={props.onClick}
                >
                {/* left side radio button */}
                <Box sx={{ flexGrow: 0 }}>
                    <Controller
                            name="type"
                            control={props.control}
                            rules={{ 
                                required: true, 
                            }}
                            render={({ field }) => 
                                <FormControlLabel 
                                    {...field} 
                                    value={type}
                                    control={<Radio color="primary" data-testid={"radio-type-" + type} />} 
                                    label={""} />
                            } />
                </Box>
                {/* right side content */}
                <Box sx={{ flexGrow: 1, p: 0.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                                <Typography variant="h1" color={theme.palette.primary.main}><Trans k={`protection_type_names.${type}`} /></Typography>
                            </Box>
                            <Typography variant="body2"><Trans k={`coverage_type.description.${type}`} /></Typography>
                        </Box>
                        <Typography color="white" sx={{ m: 1 }}>
                            <FontAwesomeIcon icon={getIcon(type)} size="3x" />
                        </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ py: 1 }} color="primary"><Trans k="coverage_type.payout_scheme" /></Typography>
                    { payoutScheme !== null && payoutScheme.map((e: PayoutSchemeEntry, i) => {
                        return <NameValueBox 
                                    name={`MMI ${e.mmiLevel}+`} 
                                    value={`${props.symbol} ${formatAmountNum(e.payout)}`} 
                                    noColon={true}
                                    key={i} 
                                    bgColor="white" 
                                    sx={{ mb: 0.25, p: 1 }} 
                                    />;
                    })}
                </Box>
            </Card>);
}