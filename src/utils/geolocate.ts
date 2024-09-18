import { features } from "./features";
import { LOGGER } from "./logger_backend";

export async function getlocateIp(ip: string): Promise<{ latitude: number, longitude: number }> {
    let latitude = null;
    let longitude = null;
    
    // console.log("IP_GEOLOCATION_API_KEY", IP_GEOLOCATION_API_KEY, "cf-connecting-ip", request.headers.get('cf-connecting-ip'));
    if (features().geoLocationApi) {
        const timeNow = new Date().getTime();
        const res = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${getGeoLocationApiKey()}&ip=${ip}`);
        const timeAfter = new Date().getTime();
        LOGGER.info(`geolocate fetch time:  ${timeAfter - timeNow} ${res.ok}`);
        if (res.ok) {
            const json = await res.json();
            // console.log("geolocate json", json);
            latitude = json.latitude;
            longitude = json.longitude;
        }
    }

    return { latitude, longitude };
}

const IP_GEOLOCATION_API_KEY = process.env.IP_GEOLOCATION_API_KEY;

export function getGeoLocationApiKey() {
    return IP_GEOLOCATION_API_KEY;
}
