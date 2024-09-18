
import { CardActionArea, CardContent, Card as MuiCard, SxProps, Theme } from "@mui/material";

export default function Card({ 
    children, 
    sx, 
    sxContent, 
    elevation,
    variant,
    onCardClicked,
    className,
    classNameContent,
    ...dataAttribute
}: { 
    children: React.ReactNode, 
    sx?: SxProps<Theme>, 
    sxContent?: SxProps<Theme>, 
    elevation?: number,
    variant?: "elevation" | "outlined" | undefined,
    onCardClicked?: () => void,
    className?: string,
    classNameContent?: string,
} & {[dataAttribute: `data-${string}`]: string}) {
    // merge the default styles with the styles passed in
    const msx = { 
        borderRadius: 4,
        backgroundColor: 'white',
        left: 0,
        right: 0,
        ...sx,
    };
    const cardContent = (<CardContent sx={sxContent} className={classNameContent}>
            {children}
        </CardContent>);
    return (<MuiCard sx={msx} elevation={elevation} data-testid={dataAttribute['data-testid']} variant={variant} className={className}>
            { onCardClicked !== undefined && 
                <CardActionArea onClick={onCardClicked}>
                    {cardContent}
                </CardActionArea>
            }
            { onCardClicked === undefined && 
                cardContent
            }
        </MuiCard>);
}
