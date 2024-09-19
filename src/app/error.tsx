'use client';

import { Alert } from "@mui/material";
import { logErrorOnBackend } from "../utils/logger";
import { useEffect } from "react";


export default function Error({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
    useEffect(() => {
        logErrorOnBackend(error.message, JSON.stringify(error), "error boundary");
    }, [error]);

    return <Alert severity="error" onClose={resetErrorBoundary}>{error.message}</Alert>;
}
