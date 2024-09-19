
export function useERC721Contract(/*nftAddress: string*/) {
    // const { trackEvent } = useAnalytics();

    async function getNftIds(
        // owner: string,
        //signer: Signer,
    ): Promise<bigint[]> {
        // // const chainNft = IChainNft__factory.connect(nftAddress, signer);
        // const chainNft = null;
        // const numTokens = await chainNft.balanceOf(owner);
        // console.log("getNftIds - nftAddress, owner, numTokens", nftAddress, owner, numTokens.toString());
        // const tokensIds = [];
        // for (let i = 0; i < numTokens; i++) {
        //     tokensIds.push(await chainNft.tokenOfOwnerByIndex(owner, i));
        // }
        // return tokensIds;
        return [];
    }

    async function transferNft(
        // nftId: bigint,
        // recipient: string,
        // signer: Signer,
    ): Promise<boolean> {
        return true;
        // trackEvent(EVENT_TRANSFER_NFT_TX_START);
        // // const chainNft = IChainNft__factory.connect(nftAddress, signer);
        // const chainNft = null;
        // const tx = await chainNft["safeTransferFrom(address,address,uint256)"](signer.getAddress(), recipient, nftId);
        // console.log("tx", tx)
        // const rcpt = await tx.wait();
        // console.log("rcpt", rcpt);
        // const success = rcpt.status === 1;
        // const newOwner = await chainNft.ownerOf(nftId);
        // console.log("transferNft - nftAddress, nftId, recipient, success, newOwner", nftAddress, nftId.toString(), recipient, success, newOwner);
        // if (! success) {
        //     trackEvent(EVENT_TRANSFER_NFT_TX_FAIL);
        //     throw new BaseError("transferNft failed. success === false ");
        // }
        // trackEvent(EVENT_TRANSFER_NFT_TX_SUCCESS);
        // if (newOwner !== recipient) {
        //     throw new BaseError("transferNft failed - newOwner !== recipient");
        // }
        // return success;
    }

    return {
        getNftIds,
        transferNft,
    }
}
