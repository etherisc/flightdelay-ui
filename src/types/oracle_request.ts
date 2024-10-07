
export type OracleRequest = {
    timestamp?: number;
}

export type OracleResponse = {
    requestId: string;
    error?: string;
}