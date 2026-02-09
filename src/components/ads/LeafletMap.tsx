"use client";

import React from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
    center: [number, number];
    zoom: number;
    radius: number;
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
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
                center={center}
                pathOptions={{
                    fillColor: '#ea580c',
                    color: '#ea580c',
                    fillOpacity: 0.15,
                    weight: 1
                }}
                radius={radius}
            />
        </MapContainer>
    );
}
