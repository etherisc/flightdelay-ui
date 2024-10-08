'use client';

import { Signer, parseUnits, resolveAddress } from "ethers";
import { ERC20__factory, IERC20Permit__factory } from "../../contracts/openzeppelin-contracts";

/** Signer cannot be provided here as Signer retrieval is async and cannot be done from within a component (which uses the hook) */
export function useERC20Contract(tokenAddress: string, decimals: number) {
    // const { trackEvent } = useAnalytics();
    
    async function convertAmountToWei(
        amount: number
    ) {
        return parseUnits(amount.toString(), decimals);
    }

    // async function createApproval(
    //     amountInWei: bigint,
    //     spenderAddress: string,
    //     signer: Signer,
    // ): Promise<void> {
    //     trackEvent(EVENT_ERC20_APPROVAL_START);
    //     const token = ERC20__factory.connect(tokenAddress, signer);
    //     const existingAllowance = await token.allowance(await signer.getAddress(), spenderAddress);
    //     if (existingAllowance >= amountInWei) {
    //         trackEvent(EVENT_ERC20_APPROVAL_EXISTS);
    //         console.log("allowance already set and large enough", existingAllowance, amountInWei);
    //         return;
    //     }
    //     const tx = await token.approve(spenderAddress, amountInWei, { gasLimit: 100000 });
    //     console.log("approval tx", tx)
    //     const receipt = await tx.wait();
    //     console.log("approval tx mined", receipt, tx)

    //     if (receipt!.status !== 1) {
    //         trackEvent(EVENT_ERC20_APPROVAL_FAIL);
    //         throw new BaseError("ERC20-001:TX_FAILED", `tx hash: ${receipt!.hash}`);
    //     }

    //     trackEvent(EVENT_ERC20_APPROVAL_SUCCESS);
        
    //     // now check if allowance is set and large enough
    //     const allowanceAfterApproval = await token.allowance(await signer.getAddress(), spenderAddress);
    //     if (allowanceAfterApproval < amountInWei) {
    //         throw new BaseError("ERC20-002:ALLOWANCE_TOO_SMALL", `allowance too small: ${allowanceAfterApproval}`);
    //     }
    // }

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
