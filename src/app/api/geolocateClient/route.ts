import { NextRequest } from "next/server";
import { getlocateIp } from "../../../utils/geolocate";

export async function GET(request: NextRequest) {
    if (request.headers.get('cf-connecting-ip') === null) {
        return Response.json({ latitude: null, longitude: null }, { status: 200 });
    }

    const { latitude, longitude } = await getlocateIp(request.headers.get('cf-connecting-ip')!);
    return Response.json({ latitude, longitude }, { status: 200 });
}
