'use client';

import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

const containerStyle = {
    width: '100%',
    height: '100%',
};

export function ConfirmationDialogMap({ lat, lng } : { lat: number, lng: number }) {
    const icon = L.icon({ 
        iconUrl: "/assets/fa-location-dot.svg", 
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
    
    return (<MapContainer style={containerStyle} center={[lat, lng]} zoom={8} dragging={false} doubleClickZoom={false}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker 
            key="city"
            position={[lat, lng]} 
            icon={icon} 
            data-testid="city-marker"
            />;   
    </MapContainer>);
}
