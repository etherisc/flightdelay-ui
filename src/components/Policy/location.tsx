"use client";

import { Box, Typography } from "@mui/material";
import { PRIMARY_BLUE } from "../../config/theme";
import { PolicyData } from "../../types/policy_data";
import { EmbeddedMap } from "./embedded_map";
import Coordinates from "../(basic_widgets)/Coordinates/coordinates";
import Trans from "../Trans/trans";
import NameValueBox from "../NameValueBox/name_value_box";

export default function Location({ policy } : { policy: PolicyData }) {
    const locationName = policy.locationName;
    const locationCoordinates = policy.locationCoordinates;
    return (<Box sx={{ 
            p: 2,
            display: 'flex', 
            flexDirection: 'column', 
            }}> 

        <Typography 
            variant="h1" 
            color="primary" 
            sx={{ 
                borderBottom: '2px solid', 
                borderColor: PRIMARY_BLUE + "44",
                pb: 1,
                mb: 1,
            }}>
            <Trans k="mypolicies.details.overview" />
        </Typography>
        <Box sx={{ height: '180px', width: '100%', py: 1 }}>
            <EmbeddedMap lat={locationCoordinates.lat} lng={locationCoordinates.lng} />
        </Box>
        <NameValueBox 
            name={<Trans k="address" />} 
            value={locationName} sx={{ py: 0, px: 1 }} 
            data-testid="location-name"
            />
        <NameValueBox 
            name={<Trans k="coordinates" />} 
            value={<Coordinates lat={locationCoordinates.lat} lng={locationCoordinates.lng}/>} sx={{ py: 0, px: 1 }} 
            data-testid="location-coordinates"
            />
    </Box>);
}