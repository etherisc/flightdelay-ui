
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
    // this is the string as expected by the smart contract, e.g. "2024-10-14T10:10:00.000 Asia/Seoul"
    departureTimeLocal: string,
    arrivalTime: number,
    // this is the string as expected by the smart contract, e.g. "2024-10-14T10:10:00.000 Asia/Seoul"
    arrivalTimeLocal: string,
    premiumAmount: bigint,
    statistics: number[],
    v: number;
    r: string;
    s: string;
}