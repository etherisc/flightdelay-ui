'use client';
import { useEffect, useState } from "react";

export function useLocationIQAutocomplete(queryString: string) {
    const [ data, setData ] = useState<Array<LocationIQResult>>([]);
    const [ error, setError ] = useState<string>("");
    const [ loading, setLoading ] = useState<boolean>(false);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if (queryString.length >= 3) {
                const url = `/api/autocomplete?q=${encodeURI(queryString)}`;
                const res = await fetch(url);

                if (!res.ok) {
                    switch (res.status) {
                        case 404:
                            setData([]);
                            return;
                        case 429:
                            console.log("Error fetching locationIQ autocomplete, rate limit exceeded. ignoring request");
                            return;
                        default:
                            console.log("Error fetching locationIQ autocomplete", res.status, res.statusText);
                            setError(res.statusText);
                    }
                } else {
                    setData(await res.json() as Array<LocationIQResult>);
                }
            } else {
                setData([]);
            }
            setLoading(false);
        }
        fetchData();
    }, [queryString]);

    return { data, error, loading };
}

export type LocationIQResult = {
    place_id: string;
    lat: number;
    lon: number;
    display_name: string;
    display_place: string;
    display_address: string;
}
