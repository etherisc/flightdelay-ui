import { Box, SxProps, Theme, Typography } from "@mui/material";
import React from "react";

export default function NameValueBox(
    { 
        name, value, bgColor, roundedCornersTop, roundedCornersBottom, noColon, sx,
        ...dataAttribute 
    }: { 
        name: string | React.ReactNode, value: string | React.ReactNode, bgColor?: string, 
        roundedCornersTop?: boolean, roundedCornersBottom?: boolean, noColon?: boolean, sx?: SxProps<Theme>
    } & {[dataAttribute: `data-${string}`]: string}) {
    const BORDER_RADIUS = 8;
    const colon = noColon ? "" : ":";
    return(
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'baseline',
                px: 2, py: 1, 
                borderTopLeftRadius: roundedCornersTop ? BORDER_RADIUS : 0,
                borderTopRightRadius: roundedCornersTop ? BORDER_RADIUS : 0,
                borderBottomLeftRadius: roundedCornersBottom ? BORDER_RADIUS : 0,
                borderBottomRightRadius: roundedCornersBottom ? BORDER_RADIUS : 0,
                backgroundColor: bgColor, 
                ...sx,
            }}
            data-testid={dataAttribute['data-testid']}
            >
            <Typography sx={{ flexGrow: 0 }} color="primary" component="span" fontWeight={500} >
                {name}{colon}
            </Typography>
            <Typography sx={{ flexGrow: 1, textAlign: 'right' }} component="span" fontWeight={500} >
                {value}
            </Typography>
        </Box>);
}
