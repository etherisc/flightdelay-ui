import { ethers, JsonRpcProvider, Signer } from "ethers";

export async function getBackendVoidSigner(): Promise<Signer> {
    const provider = new JsonRpcProvider(process.env.BACKEND_CHAIN_RPC_URL);
    return new ethers.VoidSigner("0x0000000000000000000000000000000000000000", provider);
}
