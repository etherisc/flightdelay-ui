import { IERC20__factory } from "../contracts/openzeppelin-contracts";
import { Signer } from 'ethers';

export async function getBalance(erc20TokenContractAddress: string, walletAddress: string, signer: Signer): Promise<bigint> {
    const erc20TokenContract = IERC20__factory.connect(erc20TokenContractAddress, signer);
    return await erc20TokenContract.balanceOf(walletAddress);
}
