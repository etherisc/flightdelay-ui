
export async function GET() {
    return Response.json({
        chainId: process.env.NEXT_PUBLIC_EXPECTED_CHAIN_ID,
        productContract: process.env.NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS,
        nftContract: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
        erc20TokenContract: process.env.NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS,
    }, { status: 200 });
}
