'use client';

import L, { LeafletMouseEvent } from 'leaflet';
import React, { useEffect, useRef } from 'react';
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import { QApiCity } from '../../types/qapi/city';

const containerStyle = {
    width: '100%',
    height: '100%',
};

// center of the map when opened
const center = {
    // Jakarta
    lat: -6.21462,
    lng: 106.84513,
};

interface MapProps {
    clientLatitude: number | null;
    clientLongitude: number | null;
    flyToCoordinates: { lat: number | null, lon: number | null };
    cities: QApiCity[];
    onMapMovedTo: (lat: number, lng: number, zoom: number) => void;
    onCitySelected: (cityId: QApiCity) => void;
}

export default function Map(props: MapProps) {
    // handle view position updates from outside
    const citiesMarkers = [];
    for(const city of props.cities) {
        // console.log("show city marker for: ", city);
        const icon = L.icon({ 
            iconUrl: "/assets/fa-location-dot.svg", 
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });
        citiesMarkers.push(<Marker 
            key={city.id} 
            position={[city.lat, city.lon]} 
            icon={icon} 
            data-testid={`city-marker-${city.id}`}
            eventHandlers={{
                click: (e: LeafletMouseEvent) => {
                    console.log("clicked city marker", e);
                    props.onCitySelected(city);
                }
            }}
            />);
    }
    
    return (<MapContainer 
                style={containerStyle} 
                center={[props.clientLatitude ?? center.lat, props.clientLongitude ?? center.lng]} 
                zoom={10} 
                scrollWheelZoom={true} 
                zoomControl={false}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {citiesMarkers}
        <MapPositionTracker onMapMovedTo={(lat: number, lng: number, zoom: number) => { props.onMapMovedTo(lat, lng, zoom); }} />
        <FlyTo lat={props.flyToCoordinates.lat} lon={props.flyToCoordinates.lon} />
        <ZoomControl 
            position="bottomleft"
            />
    </MapContainer>);
}

/**
 * Tracks clicks and updates marker to location. 
 */
function MapPositionTracker({ onMapMovedTo } : { onMapMovedTo: (lat: number, lng: number, zoom: number) => void }) {
    const map = useMap();

    useEffect(() => {
        console.log("map position tracker mounted");
        const c = map.getCenter();
        const zoom = map.getZoom();
        onMapMovedTo(c.lat, c.lng, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useMapEvents({ 
        moveend(e: LeafletMouseEvent) {
            console.log("moved map to", e);
            const c = map.getCenter();
            const zoom = map.getZoom();
            onMapMovedTo(c.lat, c.lng, zoom);
        },
    });

    return null;
}


/**
 * Tracks view position and moves to location if provided
 */
function FlyTo({ lat, lon } : { lat: number | null, lon: number | null }) {
    const map = useMap();
    const prevCoords = useRef<{ lat: number | null, lon: number | null }>({ lat: null, lon: null });

    // only fly to when changed
    if (lat != null && lon != null && (prevCoords.current.lat !== lat || prevCoords.current.lon !== lon)) {
        map.flyTo([lat, lon], 11);
        prevCoords.current = { lat, lon };
    }

    return null;
}

