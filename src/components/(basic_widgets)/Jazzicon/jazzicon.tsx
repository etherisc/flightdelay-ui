import jazzicon from "jazzicon";
import { useEffect, useRef } from "react";

export default function Jazzicon({ address }: { address: string }) {
    const ref = useRef(null);

    function numberForAddress(address: string): number {
        const addr = address.slice(2, 10);
        const seed = parseInt(addr, 16);
        return seed;
    }

    useEffect(() => {
        if (address === null || address.length !== 42) {
            ref.current.innerHTML = '';
            return;
        }
        
        if (ref.current) {
            ref.current.innerHTML = '';
            const el = jazzicon(42, numberForAddress(address));
            ref.current.appendChild(el);
        }
    }, [address]);

    return (<span ref={ref} />);
}