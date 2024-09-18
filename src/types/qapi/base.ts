export interface ResponseBase {
    request: string;
    success: 0|1;
    reqBudget: number
    sec2reset: number;
    err_id?: number;
    err_msg?: string;
}
