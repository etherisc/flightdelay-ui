import { Box, Typography } from "@mui/material";
import Link from "next/link";
import BackButton from "../BackButton/back_button";

export default function PageHeader({ text, href } : { text: string | JSX.Element, href?: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'baseline'}}>
            <Link href={href} >
                <BackButton />
            </Link>
            <Typography color="primary" variant="h2" sx={{ ml: 2 }}>
                {text}
            </Typography>
        </Box>);
}

