import { ethers } from "ethers";
import { DecodedError } from "ethers-decode-error";

export enum Reason {
    COMM_ERROR,
    NO_FLIGHT_FOUND,
    INCONSISTENT_DATA,
    NOT_ENOUGH_DATA_FOR_QUOTE,
    NOT_ENOUGH_CAPACITY,
}

export enum PurchaseErrorCode {
    NO_FLIGHT_FOUND = "NO_FLIGHT_FOUND",
    INCONSISTENT_DATA = "INCONSISTENT_DATA",
    AIRPORT_BLACKLISTED = "AIRPORT_BLACKLISTED",
    AIRPORT_NOT_WHITELISTED = "AIRPORT_NOT_WHITELISTED",
}

export class FlightNotFoundError extends Error {
    constructor(message = 'Flight not found') {
        super(message);
    }
}

export class InconsistentFlightDataError extends Error {
    constructor(message = 'Inconsistent flight data') {
        super(message);
    }
}

/**
 * Exception thrown when a transaction fails. Contains the transaction receipt in field `transaction`.
 */
export class TransactionFailedException extends Error {
    transaction: ethers.TransactionReceipt | null;
    decodedError: DecodedError | null;

    constructor(tx: ethers.TransactionReceipt| null, decodedError: DecodedError | null) {
        super(`Transaction failed: ${tx?.hash}`);
        this.transaction = tx;
        this.decodedError = decodedError;
    }

}

export class AirportBlacklistedError extends Error {
    constructor(airport: string) {
        super(`Airport ${airport} is blacklisted`);
    }
}

export class AirportNotWhitelistedError extends Error {
    constructor(airport: string) {
        super(`Airport ${airport} is not whitelisted`);
    }
}
