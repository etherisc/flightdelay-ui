import { faWallet } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Avatar, Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Card from "../(basic_widgets)/Card/card";
import { BLUE_LIGHT, PRIMARY_BLUE } from "../../config/theme";
import { formatAmount, formatAmountNum } from "../../utils/amount";
import ErrorAlert from "./error_alert";
import ReferralCode from "./referral_code";
import Button from "../Button/button";
import Trans from "../Trans/trans";
import NameValueBox from "../NameValueBox/name_value_box";

export interface IPaymentFormValues {
    acceptTAndC: boolean;
}

export default function WalletConnected({ 
    symbol, 
    premium,
    finalPremium,
    referralCode, 
    referralCodeDiscount,
    address,
    balance,
    error,
    onApplyReferralCode,
    onBuy,
} : { 
    symbol: string, 
    premium: number, 
    finalPremium: number,
    referralCode: string | null,
    referralCodeDiscount: number,
    address: string,
    balance: bigint | null,
    error?: Error,
    onApplyReferralCode?: (referralCode: string) => Promise<void>,
    onBuy?: () => Promise<void>,
}) {
    const { handleSubmit, control, formState } = useForm<IPaymentFormValues>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        shouldFocusError: false,
        defaultValues: {
            acceptTAndC: false,
        }
    });

    const onSubmit: SubmitHandler<IPaymentFormValues> = async data => {
        console.log("payment", data);
        await onBuy();
    };

    const addressShort = address.substr(0, 6) + "…" + address.substr(address.length - 4, 4);
    const errors = useMemo(() => formState.errors, [formState]);

    let finalPriceMarkup = <Typography variant="h6" color="primary">{symbol} {formatAmountNum(finalPremium)}</Typography>;
    if (finalPremium != premium) {
        finalPriceMarkup = <>
            <Typography variant="h6" color="primary" component="span" sx={{ mr: 1 }}>{symbol}</Typography>
            <Typography variant="h6" color={grey[400]} component="span" sx={{ mr: 1, textDecoration: 'line-through' }}>{formatAmountNum(premium)}</Typography>
            <Typography variant="h6" color="primary" component="span">{formatAmountNum(finalPremium)}</Typography>
        </>;
    }



    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-start' }}>
            <Button fullwidth onClick={handleSubmit(onSubmit)}>
                <Trans k="action.buy_protection" values={{ amount: `${symbol} ${formatAmountNum(finalPremium)}`}} />
            </Button>
            <Box sx={{ width: '100%', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ flexGrow: 1 }}>&nbsp;</Box> {/* spacer */}
                    {errors.acceptTAndC !== undefined && 
                        <Alert variant="outlined" severity="error" sx={{ mb: 2 }} data-testid="error-no-type-selected">
                            <Trans k="error.accept_t_and_c_not_checked" />
                        </Alert>
                    }
                    {error && 
                        <ErrorAlert error={error} />
                    }
                    <Controller
                        name="acceptTAndC"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => 
                            <FormControlLabel 
                                sx={{ px: 2, py: 1, flexGrow: 0 }}
                                control={
                                    <Checkbox 
                                        defaultChecked={false}
                                        {...field}
                                        />
                                } 
                                label={<Typography variant="body1" ><Trans k="checkout.accept_t_and_c" /></Typography>}
                                />
                        } />
                    <NameValueBox 
                        sx={{ flexGrow: 0}}
                        name={<Trans k="premium" />} 
                        value={finalPriceMarkup} 
                        />
                </Box>
            </Box>
            <ReferralCode referralCode={referralCode} referralCodeDiscount={referralCodeDiscount} onApplyReferralCode={onApplyReferralCode} />
            <Box sx={{ flexGrow: 0, mt: 2, width: '100%' }}>
                <Card 
                    elevation={0}
                    sx={{ 
                        backgroundColor: BLUE_LIGHT,
                    }} 
                    sxContent={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center',
                    }}>
                    <Avatar sx={{ flexGrow: 0, p: 2, backgroundColor: PRIMARY_BLUE }}>
                        <FontAwesomeIcon icon={faWallet} color="primary"/>
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }} data-testid="wallet-details">
                        <NameValueBox name={<Trans k="your_wallet" />} value={addressShort} sx={{ py: 0 }} />
                        <NameValueBox name={<Trans k="balance" />} value={`${symbol} ${formatAmount(balance)}`} sx={{ py: 0 }} />
                    </Box>
                </Card>
            </Box>
        </Box>);
}
