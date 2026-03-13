"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
    center: [number, number];
    zoom: number;
    radius: number;
}

const orangeMarkerIcon = new L.DivIcon({
    className: "",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: #f97316;
        border: 3px solid rgba(255,255,255,0.85);
        box-shadow: 0 10px 18px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

function OpenGoogleMapsOnClick({ center }: { center: [number, number] }) {
    useMapEvent("click", () => {
        const [lat, lng] = center;
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, "_blank", "noopener,noreferrer");
    });
    return null;
}

export default function LeafletMap({ center, zoom, radius }: LeafletMapProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            className="h-full w-full"
            zoomControl={false}
            dragging={false}   // Disable dragging for a static, clean look
            touchZoom={false}  // Disable touch zoom
            doubleClickZoom={false} // Disable double click zoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={center} icon={orangeMarkerIcon} />
            <OpenGoogleMapsOnClick center={center} />
        </MapContainer>
    );
}
