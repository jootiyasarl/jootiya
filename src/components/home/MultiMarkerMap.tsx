"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect } from "react";

// Helper to get icons after Leaflet is loaded in component
let defaultIcon: L.Icon;
let userIcon: L.DivIcon;

const initIcons = () => {
    if (defaultIcon) return;

    defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const userIconHtml = `
      <div class="relative flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-sm"></span>
      </div>
    `;

    userIcon = L.divIcon({
        className: "",
        html: userIconHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

export interface AdMarker {
    id: string;
    title: string;
    price: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
}

interface MultiMarkerMapProps {
    ads: AdMarker[];
    center: [number, number];
    zoom: number;
    userLocation?: [number, number] | null;
    radiusKm?: number;
}

// Better approach: component inside that uses useMap
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
}

export default function MultiMarkerMap({ ads, center, zoom, userLocation, radiusKm }: MultiMarkerMapProps) {
    // Initialize icons on first render
    initIcons();

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            className="h-full w-full"
            zoomControl={false}
        >
            <ChangeView center={center} zoom={zoom} />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />

            {/* Search Radius Circle around User */}
            {userLocation && radiusKm && (
                <Circle
                    center={userLocation}
                    radius={radiusKm * 1000} // convert km to meters
                    pathOptions={{ color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.1, weight: 1 }}
                />
            )}

            {/* User Location Marker */}
            {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                    <Popup>Votre position actuelle</Popup>
                </Marker>
            )}

            {/* Ads Markers */}
            {ads.map((ad) => (
                <Marker key={ad.id} position={[ad.latitude, ad.longitude]} icon={defaultIcon}>
                    <Popup className="custom-popup">
                        <div className="min-w-[160px] p-1 font-sans">
                            <h3 className="font-bold text-xs text-zinc-900 mb-1 line-clamp-2 leading-tight">{ad.title}</h3>
                            <p className="text-orange-600 font-extrabold text-sm mb-2">{ad.price}</p>
                            <Link href={`/ads/${ad.id}`} className="block w-full text-center text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white py-2 rounded-lg hover:bg-zinc-800 transition-colors">
                                Voir l'annonce
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
