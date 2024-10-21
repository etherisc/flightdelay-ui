export async function logErrorOnBackend(message: string, stackToSubmit?: unknown, action?: string) {
    console.log(message, stackToSubmit);
    const body = JSON.stringify({
        message: message,
        stack: stackToSubmit,
        action: action || 'unknown',
        client_timestamp : Math.floor(Date.now()),
    });
    if (process.env.SUPPRESS_BACKEND_LOGS?.toLowerCase() === 'true') {
        return;
    }
    await fetch('/api/clientError', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    });
}

export async function logOnBackend(message: string) {
    console.log(message);
    const body = JSON.stringify({
        message: message,
        client_timestamp : Math.floor(Date.now()),
    });
    if (process.env.SUPPRESS_BACKEND_LOGS?.toLowerCase() === 'true') {
        return;
    }
    await fetch('/api/clientLog', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    });
}


