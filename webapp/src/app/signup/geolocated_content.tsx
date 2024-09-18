import { headers } from 'next/headers';
import { features } from '../../utils/features';
import { getlocateIp } from '../../utils/geolocate';
import { Content } from './content';

/**
 * Extracted to own component so it can be used by route with referral path
 * @returns 
 */
export default async function GeolocatedContent({ referralCode } : { referralCode?: string }) {
    
    async function getGeolocation(reqHeaders: Headers): Promise<{ latitude: number | null, longitude: number | null }> {
        if (reqHeaders.get('cf-connecting-ip') === null) {
            return { latitude: null, longitude: null };
        }
        const ip = reqHeaders.get('cf-connecting-ip');
        const { latitude, longitude } = await getlocateIp(ip);
        return { latitude, longitude };
    }

    // fetch location during ssr to avoid flickering
    const { latitude, longitude } = await getGeolocation(headers());

    return <Content features={features()} clientLatitude={latitude} clientLongitude={longitude} referralCode={referralCode} />;
}

