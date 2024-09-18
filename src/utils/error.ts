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
