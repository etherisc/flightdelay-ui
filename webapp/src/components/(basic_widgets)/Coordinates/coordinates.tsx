export default function Coordinates({ lat, lng } : { lat: number, lng: number }) {
    const y = lat >= 0 ? 'N' : 'S';
    const x = lng >= 0 ? 'E' : 'W';
    return (<>{Math.abs(lat).toFixed(4)}°{y}, {Math.abs(lng).toFixed(4)}°{x}</>);
}
