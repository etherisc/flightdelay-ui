import { Backdrop, Box, CircularProgress } from "@mui/material";
import { ZINDEX_PROGRESS_MODAL } from "../../../config/theme";

export function ProgressModal({
    children,
}: {
    children: React.ReactNode
}) {
    return (<Backdrop
                sx={{ color: '#fff', zIndex: ZINDEX_PROGRESS_MODAL }}
                open={true}
                >
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    p: 4,
                    backgroundColor: "#2228",
                    borderRadius: 4,
                    }}>
                    <CircularProgress color="inherit" sx={{ mb: 4 }} />
                    {children}
                </Box>
            </Backdrop>);
}