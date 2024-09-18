import GeolocatedContent from '../geolocated_content';

export default async function Page({
    params,
  }: {
    params: { referralCode: string; };
  }) {
    return <GeolocatedContent referralCode={params.referralCode} />;
}

