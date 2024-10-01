import { ethers, JsonRpcProvider, Signer, Wallet } from "ethers";
import { LOGGER } from "../../../utils/logger_backend";

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
