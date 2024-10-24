import { Box, Card, CardContent, Typography } from "@mui/material";
import { useEnvContext } from "next-runtime-env";
import Trans from "../Trans/trans";

export default function Airports() {
    const { NEXT_PUBLIC_AIRPORTS_WHITELIST, NEXT_PUBLIC_AIRPORTS_BLACKLIST } = useEnvContext();

    const airportsWhitelistRaw = NEXT_PUBLIC_AIRPORTS_WHITELIST?.trim() ?? '';
    const airportsWhitelist = airportsWhitelistRaw !== '' ? airportsWhitelistRaw.split(',').map((airport) => airport.trim()) : [];
    const airportsBlacklistRaw = NEXT_PUBLIC_AIRPORTS_BLACKLIST?.trim() ?? '';
    const airportsBlacklist = airportsBlacklistRaw !== '' ? airportsBlacklistRaw.split(',').map((airport) => airport.trim()) : [];
        

    return (<>
        <Card>
            <CardContent>
                { airportsWhitelist.length > 0 && 
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ py: 2}}>
                            <Typography variant="h2"><Trans k="whitelisted_airports" /></Typography>
                        </Box>
                        { airportsWhitelist.sort().map((airport, index) => {
                            let sep =", ";
                            if (index === airportsWhitelist.length - 1) {
                                sep = "";
                            }
                            return (<Typography key={airport} component="span">{airport}{sep} </Typography>);
                        })}
                        <Box sx={{ py: 2}}>
                            <Typography variant="body1">
                                <Trans k="whitelisted_airports_explanation" />
                            </Typography>
                        </Box>
                    </Box>
                }
                { airportsBlacklist.length > 0 && 
                    <Box>
                        <Box sx={{ py: 2}}>
                            <Typography variant="h2"><Trans k="blacklisted_airports" /></Typography>
                        </Box>
                        { airportsBlacklist.sort().map((airport, index) => {
                            let sep =", ";
                            if (index === airportsBlacklist.length - 1) {
                                sep = "";
                            }
                            return (<Typography key={airport} component="span">{airport}{sep} </Typography>);
                        })}
                        <Box sx={{ py: 2}}>
                            <Typography variant="body1">
                                <Trans k="blacklisted_airports_explanation" />
                            </Typography>
                        </Box>
                    </Box>
                }
            </CardContent>
        </Card>
    </>);
}