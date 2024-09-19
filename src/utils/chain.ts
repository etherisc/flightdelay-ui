import { Signer } from "ethers";

export const chainId = async (signer: Signer) =>  (await signer.provider!.getNetwork()).chainId;
