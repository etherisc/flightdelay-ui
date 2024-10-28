import Trans from "../components/Trans/trans";
import { dayjs } from "./date";
import { blue, green, grey, red } from "@mui/material/colors";

export function getFlightStateText(state: string, departureTimeUtc: number, delay: number, t: (key: string) => string): { text: JSX.Element, color: string } {
    const nowUtc = dayjs.utc().unix();
    let text = <></>;
    let color = grey[900] as string;

    switch (state) {
        case 'S': // scheduled
            if (departureTimeUtc !== null && departureTimeUtc < nowUtc) {
                text = <>{t('flight_state.en_route')}</>;
                color = blue[600];
            } else {
                text = <>{t('flight_state.scheduled')}</>;
            }
            break;
        case 'A': // active
            text = <>{t('flight_state.en_route')}</>;
            color = blue[600];
            break;
        case 'L': // landed
            if (delay !== null && delay > 0) {
                text = <>{t('flight_state.delayed')} {delay} <Trans k="minutes" /></> ;
                if (delay > 45) {
                    color = red[500];
                }
            } else {
                text = <>{t('flight_state.punctual')}</>;
                color = green[600];
            }
            break;
        case 'C': // cancelled
            text = <>{t('flight_state.cancelled')}</>;
            color = red[500];
            break;
        case 'D': // diverted
            text = <>{t('flight_state.diverted')}</>;
            color = red[500];
            break;
        
        default: 
            text = <>{t('flight_state.unknown')}</>;
            color = grey[500];
            break;
    }

    return { text, color };
}