"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent, Marker as LeafletMarker } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";

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
    onAddressSelect?: (address: { city: string; neighborhood: string }) => void;
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

export function AdLocationPicker({ latitude, longitude, onChange, onAddressSelect }: AdLocationPickerProps) {
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const lastCoords = useRef<{ lat: number; lng: number } | null>(null);

    // Debounced Reverse Geocoding
    useEffect(() => {
        if (!latitude || !longitude || !onAddressSelect) return;

        // Skip if coordinates haven't changed much (prevent unnecessary calls)
        if (lastCoords.current && 
            Math.abs(lastCoords.current.lat - latitude) < 0.0001 && 
            Math.abs(lastCoords.current.lng - longitude) < 0.0001) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsReverseGeocoding(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr`
                );
                const data = await response.json();
                
                if (data.address) {
                    const city = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
                    const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.district || "";
                    
                    if (city || neighborhood) {
                        onAddressSelect({ city, neighborhood });
                        lastCoords.current = { lat: latitude, lng: longitude };
                    }
                }
            } catch (error) {
                console.error("Reverse Geocoding Error:", error);
            } finally {
                setIsReverseGeocoding(false);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [latitude, longitude, onAddressSelect]);

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
                <div className="flex items-center gap-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        Localisation exacte sur la carte
                    </label>
                    {isReverseGeocoding && <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />}
                </div>
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
