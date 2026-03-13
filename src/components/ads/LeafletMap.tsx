"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
    center: [number, number];
    zoom: number;
    radius: number;
}

type TileProvider = {
    id: string;
    url: string;
    attribution: string;
    subdomains?: string | string[];
};

const TILE_PROVIDERS: TileProvider[] = [
    {
        id: "esri_dark_gray",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    {
        id: "stadia_smooth_dark",
        url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    {
        id: "osm",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
    },
];

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
    const [providerIndex, setProviderIndex] = useState(0);
    const tileErrorCountRef = useRef(0);
    const provider = TILE_PROVIDERS[Math.min(providerIndex, TILE_PROVIDERS.length - 1)];

    const tileLayerKey = useMemo(() => `${provider.id}-${providerIndex}`, [provider.id, providerIndex]);

    useEffect(() => {
        // reset error counter when provider changes
        tileErrorCountRef.current = 0;
    }, [providerIndex]);

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
                key={tileLayerKey}
                attribution={provider.attribution}
                url={provider.url}
                subdomains={provider.subdomains as any}
                eventHandlers={{
                    tileerror: (e) => {
                        tileErrorCountRef.current += 1;
                        if (tileErrorCountRef.current <= 3) {
                            console.warn("Leaflet tileerror", {
                                provider: provider.id,
                                url: provider.url,
                                count: tileErrorCountRef.current,
                                error: e,
                            });
                        }

                        // Switch provider after a few errors to avoid infinite retries
                        if (tileErrorCountRef.current >= 6) {
                            setProviderIndex((prev) => Math.min(prev + 1, TILE_PROVIDERS.length - 1));
                        }
                    },
                }}
            />
            <Marker position={center} icon={orangeMarkerIcon} />
            <OpenGoogleMapsOnClick center={center} />
        </MapContainer>
    );
}
