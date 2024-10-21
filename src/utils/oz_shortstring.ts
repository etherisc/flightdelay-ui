import { BytesLike, toUtf8String } from "ethers";

function getBytes(value: BytesLike): Uint8Array {
    if (value instanceof Uint8Array) {
        return value;
    }

    if (typeof(value) === "string" && value.match(/^0x(?:[0-9a-f][0-9a-f])*$/i)) {
        const result = new Uint8Array((value.length - 2) / 2);
        let offset = 2;
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(value.substring(offset, offset + 2), 16);
            offset += 2;
        }
        return result;
    }

    return new Uint8Array(0);
}


/**
 *  Encodes the Bytes32-encoded %%bytes%% into a string.
 */
export function decodeOzShortString(_bytes: BytesLike): string {
    const data = getBytes(_bytes);

    // Must be 32 bytes with a null-termination
    if (data.length !== 32) { throw new Error("invalid short string - not 32 bytes long"); }

    const length = data[31];

    // Determine the string value
    return toUtf8String(data.slice(0, length));
}