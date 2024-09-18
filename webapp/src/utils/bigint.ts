export function stringifyBigInt(value: bigint): string {
    if (value === null) {
        return "";
    }
    return `${value}n`;
}

export function parseBigInt(text: string): bigint | null {
    if (text === null) {
        return null;
    }
    const bigIntString = text.replace(/n$/, '');
    return BigInt(bigIntString);
}
