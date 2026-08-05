/** Deterministic wallet avatar (replaces deprecated jazzicon / color-string stack). */
export default function Jazzicon({ address }: { address: string }) {
    if (!address || address.length !== 42) {
        return <span />;
    }

    const seed = parseInt(address.slice(2, 10), 16);
    const hue = seed % 360;
    const hue2 = (seed >>> 8) % 360;
    const rot = (seed >>> 16) % 360;

    return (
        <svg width={42} height={42} viewBox="0 0 42 42" aria-hidden="true">
            <defs>
                <clipPath id={`jazz-${address}`}>
                    <circle cx="21" cy="21" r="21" />
                </clipPath>
            </defs>
            <g clipPath={`url(#jazz-${address})`}>
                <rect width="42" height="42" fill={`hsl(${hue} 70% 55%)`} />
                <rect
                    x="-10"
                    y="-10"
                    width="40"
                    height="40"
                    fill={`hsl(${hue2} 65% 45%)`}
                    transform={`rotate(${rot} 21 21)`}
                    opacity={0.85}
                />
                <circle
                    cx="28"
                    cy="14"
                    r="12"
                    fill={`hsl(${(hue + 40) % 360} 60% 40%)`}
                    opacity={0.9}
                />
            </g>
        </svg>
    );
}
