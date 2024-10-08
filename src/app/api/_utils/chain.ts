import { ethers, JsonRpcProvider, Signer, Wallet } from "ethers";
import { LOGGER } from "../../../utils/logger_backend";

const GAS_PRICE = process.env.GAS_PRICE !== undefined ? parseInt(process.env.GAS_PRICE) : undefined;

export async function getBackendVoidSigner(): Promise<Signer> {
    const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
    return new ethers.VoidSigner("0x0000000000000000000000000000000000000000", provider);
}

export async function getApplicationSenderSigner(): Promise<Signer> {
    const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
    const signer = Wallet.fromPhrase(process.env.APPLICATION_SENDER_MNEMONIC || "").connect(provider);
    LOGGER.debug(`getApplicationSenderSigner ${signer.address}`);
    return signer;
}

export async function getOracleSigner(): Promise<Signer> {
    const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
    const signer = Wallet.fromPhrase(process.env.ORACLE_MNEMONIC || "").connect(provider);
    LOGGER.debug(`getOracleSigner ${signer.address}`);
    return signer;
}

export function getTxOpts() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts = {} as any;
    if (GAS_PRICE !== undefined) {
        opts['gasPrice'] = GAS_PRICE;
    }

    return opts;
}