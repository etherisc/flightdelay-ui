'use client';

import { Signer, parseUnits, resolveAddress } from "ethers";
import { ERC20__factory, IERC20Permit__factory } from "../../contracts/openzeppelin-contracts";

/** Signer cannot be provided here as Signer retrieval is async and cannot be done from within a component (which uses the hook) */
export function useERC20Contract(tokenAddress: string, decimals: number) {
    
    async function convertAmountToWei(
        amount: number
    ) {
        return parseUnits(amount.toString(), decimals);
    }

    /** Check if the signer has enough balance */
    async function hasBalance(
        amountInWei: bigint,
        signer: Signer,
    ): Promise<boolean> {
        const token = ERC20__factory.connect(tokenAddress, signer);
        const balance = await token.balanceOf(await signer.getAddress());
        console.log("balance", balance);
        return balance >= amountInWei;
    }

    /** Get the nonce for ERC20Permit calculation */
    async function getNonce(signer: Signer): Promise<bigint> {
        const permit = IERC20Permit__factory.connect(tokenAddress, signer);
        return await permit.nonces(await resolveAddress(signer))
    }

    /** Get the name of the token */
    async function getName(signer: Signer): Promise<string> {
        const token = ERC20__factory.connect(tokenAddress, signer);
        return await token.name();
    }



    return {
        convertAmountToWei,
        hasBalance,
        getNonce,
        getName,
    } 
}
