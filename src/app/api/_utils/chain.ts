import { ethers, JsonRpcProvider, resolveAddress, Signer, Wallet } from "ethers";
import { LOGGER } from "../../../utils/logger_backend";

const GAS_PRICE = process.env.GAS_PRICE !== undefined ? parseInt(process.env.GAS_PRICE) : undefined;

export async function getBackendVoidSigner(): Promise<Signer> {
    const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
    return new ethers.VoidSigner("0x0000000000000000000000000000000000000000", provider);
}

export async function getStatisticsProviderSigner(): Promise<Signer> {
    const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
    const signer = Wallet.fromPhrase(process.env.STATISTICS_PROVIDER_MNEMONIC || "").connect(provider);
    LOGGER.debug(`getStatisticsProviderSigner ${signer.address}`);
    return signer;
}

export async function getStatusProviderSigner(): Promise<Signer> {
    const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
    const signer = Wallet.fromPhrase(process.env.STATUS_PROVIDER_MNEMONIC || "").connect(provider);
    LOGGER.debug(`getStatusProviderSigner ${signer.address}`);
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


export async function checkSignerBalance(signer: Signer, minBalance: bigint): Promise<boolean> {
    const balance = await signer.provider?.getBalance(signer.getAddress());
    LOGGER.debug(`balance for signer (${await resolveAddress(signer)}): ${balance} min: ${minBalance}`);
    if (balance === undefined || balance < minBalance) {
        LOGGER.error(`insufficient balance for signer (${await resolveAddress(signer)}): ${balance}`);
        return false;
    }
    return true;
}
