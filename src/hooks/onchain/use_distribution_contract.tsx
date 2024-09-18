'use client';

import { Signer } from "ethers";

export function useDistributionContract(productContractAddress: string) {

    async function calculateDiscountPercentage(signer: Signer, referralCode: string): Promise<{
        discountPercentage: number,
        referralStatus: number,
    }> {
        // const productContract = ProductV01__factory.connect(productContractAddress, signer);
        // const distributionAddress = await productContract.getDistribution();
        // const distributionContract = DistributionV01__factory.connect(distributionAddress, signer);
        // console.log("calculateDiscountPercentage -->", referralCode);

        // const { discountPercentage, status } = await distributionContract["getDiscountPercentage(string)"](referralCode);

        // // convert ufixed to percentage number with 2 decimals
        // const readerAdress = await distributionContract.getReader();
        // const instanceReader = InstanceReader__factory.connect(readerAdress, signer);
        // const pct = Number(await instanceReader.toInt(discountPercentage * BigInt(100))) / 100;
        // console.log("calculateDiscountPercentage <--", discountPercentage, pct, status);
        
        // return {
        //     discountPercentage: pct,
        //     referralStatus: Number(status),
        // }
        return {
            discountPercentage: 0,
            referralStatus: 0,
        }
    }

    return {
        calculateDiscountPercentage,
    } 
}
