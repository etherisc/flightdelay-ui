import { NextRequest } from "next/server";

/**
 * get rating from flightstats and calculate payout amounts via smart contract call 
 * flightstats docs: https://developer.flightstats.com/api-docs/ratings/v1
 */
export async function GET(request: NextRequest, { params } : { params: { nftId: string } }) {
    return Response.json({ nftId: params.nftId, hello: "world" }, { status: 200 })

}