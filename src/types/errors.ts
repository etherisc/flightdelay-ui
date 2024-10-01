import { ethers } from "ethers";

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

    constructor(tx: ethers.ContractTransactionReceipt| null) {
        super(`Transaction failed: ${tx?.hash}`);
        this.transaction = tx;
    }
}