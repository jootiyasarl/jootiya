"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

// Fix Leaflet default icon issue in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface AdLocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onChange }: { position: L.LatLngExpression, onChange: (lat: number, lng: number) => void }) {
    const markerRef = useRef<L.Marker>(null);

    const map = useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const { lat, lng } = marker.getLatLng();
                    onChange(lat, lng);
                }
            },
        }),
        [onChange]
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={customIcon}
        />
    );
}

export function AdLocationPicker({ latitude, longitude, onChange }: AdLocationPickerProps) {
    // Default to Casablanca if no location provided
    const defaultCenter: [number, number] = [33.5731, -7.5898];
    const center: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter;

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChange(position.coords.latitude, position.coords.longitude);
            },
            () => {
                alert("Impossible de récupérer votre position.");
            }
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                    Localisation exacte sur la carte
                </label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLocateMe}
                    className="h-8 text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                    <Navigation className="w-3 h-3 mr-1.5" />
                    Ma position
                </Button>
            </div>

            <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative z-0">
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    style={{ zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={center}
                        onChange={onChange}
                    />
                </MapContainer>
            </div>
            <p className="text-[10px] text-zinc-400 text-center">
                Déplacez le marqueur ou cliquez sur la carte pour préciser l'emplacement.
            </p>
        </div>
    );
}
