import { faPlaneArrival, faPlaneDeparture } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, LinearProgress, Typography } from "@mui/material";
import { blue, green, grey, red } from "@mui/material/colors";
import Grid from '@mui/material/Grid2';
import { useTranslation } from "react-i18next";
import { FlightPlan } from "../../types/flight_plan";
import { PolicyData } from "../../types/policy_data";
import { dayjs } from "../../utils/date";
import Trans from "../Trans/trans";
import { useEnvContext } from "next-runtime-env";
import { formatAmount } from "../../utils/amount";

export default function PoliciesListMobile({ policies, loading }: { policies: PolicyData[], loading: boolean }) {

    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    if (policies.length === 0 && !loading) {
        return <><Trans k="no_policies_mobile" /></>;
    }


    return (<>
        {loadingIndicator}
        {policies.map((policy) => {
            return <Policy policy={policy} key={policy.nftId} />
        })}
    </>);
}

function Policy({ policy }: { policy: PolicyData }) {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();

    function formatState(flightPlan: FlightPlan) {
        let text;
        let color = grey[900] as string;
        const additional = undefined;
        const state = flightPlan.status;
        const delay = flightPlan.delay;
        const nowUtc = dayjs.utc().unix();

        switch (state) {
            case 'S': // scheduled
                if (flightPlan.departureTimeUtc !== null && flightPlan.departureTimeUtc < nowUtc) {
                    text = t('flight_state.en_route');
                    color = blue[600];
                } else {
                    text = t('flight_state.scheduled');
                }
                break;
            case 'A': // active
                text = t('flight_state.en_route');
                color = blue[600];
                break;
            case 'L': // landed
                if (delay !== null && delay > 0) {
                    text = <>{t('flight_state.delayed')} {delay} <Trans k="minutes" /></> ;
                    color = red[500];
                } else {
                    text = t('flight_state.punctual');
                    color = green[600];
                }
                break;
            case 'C': // cancelled
                text = t('flight_state.cancelled');
                color = red[500];
                break;
            case 'D': // diverted
                text = t('flight_state.diverted');
                color = red[500];
                break;
        }
        return <Typography color={color} variant="body2">
            {text}
            {additional !== undefined ? <><br/>{additional}</> : null}
        </Typography>;
    }

    function formatPayoutAmount(payoutAmount: string, status: string): JSX.Element {
        if (status == 'S') {
            return <></>;
        }
        const amount = BigInt(payoutAmount);
        if (amount > 0) {
            return <><b>{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(amount, 6)}</b> <Trans k="payout" /></>;
        } else {
            return <Typography color={grey[500]} variant="body2"><Trans k="no_payout" /></Typography>;
        }
    }

    let departure = undefined;
    let arrival = undefined;

    if (policy.flightPlan !== null) {
        departure = dayjs.tz(policy.flightPlan.departureTimeLocal, policy.flightPlan.departureTimeLocalTimezone!);
        arrival = dayjs.tz(policy.flightPlan.arrivalTimeLocal, policy.flightPlan.arrivalTimeLocalTimezone!);
    }

    return (<Box sx={{ pb: 1, mb: 1, borderBottom: '1px solid', borderBottomColor: grey[300] }}>
        <Grid container spacing={1}>
            <Grid size={6}>
                {t("table.header.nftId")}: {policy.nftId}
            </Grid>
            <Grid size={6} sx={{ textAlign: 'right'}}>
                <b>{t('flight')}: {policy.carrier} {policy.flightNumber}</b>
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneDeparture} /> {t('from')} {policy.flightPlan?.departureAirportFsCode} @ {departure?.format('HH:mm')}
            </Grid>
            <Grid size={12}>
                <FontAwesomeIcon icon={faPlaneArrival} /> {t('to')} {policy.flightPlan?.arrivalAirportFsCode} @ {arrival?.format('HH:mm')}
            </Grid>
            <Grid size={12}>
                {formatState(policy.flightPlan!)}
                {formatPayoutAmount(policy.payoutAmount, policy.flightPlan?.status || 'S')}
            </Grid>
        </Grid>
    </Box>);
}