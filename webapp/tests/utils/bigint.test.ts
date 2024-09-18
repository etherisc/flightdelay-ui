import { parseBigInt, stringifyBigInt } from "../../src/utils/bigint"

describe('bigint', () => {
    it('should stringify bigint', () => {
        const actual = stringifyBigInt(BigInt("12345678901234567890"));
        expect(actual).toBe('12345678901234567890n');
    })

    it('should stringify bigint 0', () => {
        const actual = stringifyBigInt(BigInt(0));
        expect(actual).toBe('0n');
    })

    it('should stringify bigint 1', () => {
        const actual = stringifyBigInt(BigInt(1));
        expect(actual).toBe('1n');
    })

    it('should stringify bigint -1', () => {
        const actual = stringifyBigInt(BigInt(-1));
        expect(actual).toBe('-1n');
    })

    it('should stringify null', () => {
        const actual = stringifyBigInt(null);
        expect(actual).toBe('');
    })

    it('should parse into bigint', () => {
        const result = parseBigInt('12345678901234567890n');
        expect(result).toBe(BigInt("12345678901234567890"));
    })

    it('should parse into bigint 0', () => {
        const result = parseBigInt('0n');
        expect(result).toBe(BigInt(0));
    })

    it('should parse into bigint 1', () => {
        const result = parseBigInt('1n');
        expect(result).toBe(BigInt(1));
    })

    it('should parse into bigint -1', () => {
        const result = parseBigInt('-1n');
        expect(result).toBe(BigInt(-1));
    })

    it('should parse into null', () => {
        const result = parseBigInt(null);
        expect(result).toBe(null);
    })
})