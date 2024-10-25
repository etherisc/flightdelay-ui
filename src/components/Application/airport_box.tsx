import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";

export default function AirportBox({ airport, time }: { airport: { name: string, iata: string }, time: string | null }) {

    function formatTime(date: string | null) {
        if (date === null) {
            return '';
        }
        const d = dayjs(date);
        return <>{d.format('HH:mm')}</>;
    }

    return <Box sx={{ 
            p: 2, 
            m: 1, 
            height: '100%',
            border: '1px', 
            borderRadius: 4,
            // backgroundColor: '#E3E6F060',
            textAlign: 'center',
            alignContent: 'center',
        }}>
        <Typography fontWeight={500}>
            {airport?.name} ({airport?.iata})
        </Typography>
        @&nbsp;{formatTime(time)}
    </Box>;
}