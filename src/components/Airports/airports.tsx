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
                        <Typography variant="h2"><Trans k="whitelisted_airports" /></Typography>
                        { airportsWhitelist.sort().map((airport, index) => {
                            let sep =", ";
                            if (index === airportsWhitelist.length - 1) {
                                sep = "";
                            }
                            return (<Typography key={airport} component="span">{airport}{sep} </Typography>);
                        })}
                    </Box>
                }
                { airportsBlacklist.length > 0 && 
                    <Box>
                        <Typography variant="h2"><Trans k="blacklisted_airports" /></Typography>
                        { airportsBlacklist.sort().map((airport, index) => {
                            let sep =", ";
                            if (index === airportsBlacklist.length - 1) {
                                sep = "";
                            }
                            return (<Typography key={airport} component="span">{airport}{sep} </Typography>);
                        })}
                    </Box>
                }
            </CardContent>
        </Card>
    </>);
}