import { ethers } from "ethers";
import { DecodedError } from "ethers-decode-error";

export enum Reason {
    COMM_ERROR,
    NO_FLIGHT_FOUND,
    INCONSISTENT_DATA,
}

/**
 * Exception thrown when a transaction fails. Contains the transaction receipt in field `transaction`.
 */
export class TransactionFailedException extends Error {
    transaction: ethers.ContractTransactionReceipt | null;
    decodedError: DecodedError | null;

    constructor(tx: ethers.ContractTransactionReceipt| null, decodedError: DecodedError | null) {
        super(`Transaction failed: ${tx?.hash}`);
        this.transaction = tx;
        this.decodedError = decodedError;
    }

}