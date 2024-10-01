
export type PurchaseRequest = {
    permit: PermitData;
    application: ApplicationData;
}

export type PermitData = {
    owner: string,
    spender: string,
    value: bigint,
    deadline: number,
    v: number;
    r: string;
    s: string;
}

export type ApplicationData = {
    carrier: string,
    flightNumber: string,
    departureAirport: string,
    arrivalAirport: string,
    departureDate: string,
    departureTime: number,
    arrivalTime: number,
    premiumAmount: bigint,
    statistics: bigint[],
    v: number;
    r: string;
    s: string;
}