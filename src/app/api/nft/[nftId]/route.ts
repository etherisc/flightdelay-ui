import { toUtf8String } from "ethers";

import { NextRequest } from "next/server";
import { FlightNft__factory } from "../../../../contracts/flight";
import { LOGGER } from "../../../../utils/logger_backend";
import { APP_BASE_URL, FLIGHT_NFT_CONTRACT_ADDRESS } from "../../_utils/api_constants";
import { getStatisticsProviderSigner } from "../../_utils/chain";

/**
 * NFT metadata for tokenUri for specified tokenId (nftId)
 */
export async function GET(request: NextRequest, { params } : { params: { nftId: string } }): Promise<Response> {
    LOGGER.debug(`getting token uri for: ${params.nftId}`);

    if (process.env.RPC_NODE_URL === undefined) {
        return Response.json({
            error: "missing rpc node url"
        }, { status: 500 });
    }

    if (process.env.STATISTICS_PROVIDER_MNEMONIC === undefined || process.env.STATUS_PROVIDER_MNEMONIC === undefined) {
        return Response.json({
            error: "missing signer"
        }, { status: 500 });
    }

    // just any signer, only doing read operations
    const signer = await getStatisticsProviderSigner();

    const flightNft = FlightNft__factory.connect(FLIGHT_NFT_CONTRACT_ADDRESS, signer);
    const riskData = await flightNft.getPolicyData(params.nftId);
    LOGGER.debug(`risk data for: ${params.nftId}: ${riskData}`);

    // this is a workaround for issue #142 to handle the case when the data is stored as bytes32 and as string
    const departureTimeLocal = riskData.departureTimeLocal.startsWith("0x") ? toUtf8String(riskData.departureTimeLocal) :  riskData.departureTimeLocal;
    const arrivalTimeLocal = riskData.arrivalTimeLocal.startsWith("0x") ? toUtf8String(riskData.arrivalTimeLocal) :  riskData.arrivalTimeLocal;
        
    return Response.json({
        "name": `Etherisc Policy NFT - #${params.nftId}`,
        "description": `Protected flight: ${riskData.flightData}\nScheduled departure at: ${departureTimeLocal}\nScheduled arrival at: ${arrivalTimeLocal}\nDISCLAIMER: Due diligence is imperative when assessing this NFT.`,
        "image": `${APP_BASE_URL}/assets/images/etherisc_logo_bird_blue.svg`,
    }, { status: 200 });
}