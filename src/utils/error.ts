import { DecodedError } from "ethers-decode-error";

export function ensureError(value: unknown): Error {
    if (value instanceof Error) return value;

    let stringified = '[Unable to stringify the thrown value]';
    try {
        stringified = JSON.stringify(value);
    } catch {
        // ignore
    }

    const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`);
    return error;
}

type Jsonable = string | number | boolean | null | undefined | readonly Jsonable[] | { readonly [key: string]: Jsonable } | { toJSON(): Jsonable }

export class BaseError extends Error {
    public readonly context?: Jsonable;
    public readonly code: string;

    constructor(code: string, message?: string, options: { cause?: Error, context?: Jsonable } = {}) {
        const { cause, context } = options;

        super(message ?? code, { cause });
        this.name = this.constructor.name;

        this.code = code;
        this.context = context;
    }
}


export class PurchaseFailedError extends Error {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: any;
    decodedError: DecodedError | null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(transaction: any | null, decodedError: DecodedError | null) {
        super(`Transaction failed: ${transaction?.hash}`);
        this.transaction = transaction;
        this.decodedError = decodedError;
    }
}

export class PurchaseNotPossibleError extends Error {
    constructor() {
        super("Purchase not possible");
    }
}

export class CapacityError extends Error {
    constructor() {
        super("Capacity error");
    }
}
