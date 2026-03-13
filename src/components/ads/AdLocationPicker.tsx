"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { getBrowserGeolocation } from "@/lib/adLocation";

interface AdLocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
    onAddressSelect?: (address: { city: string; neighborhood: string }) => void;
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

    const handleLocateMe = async () => {
        try {
            const pos = await getBrowserGeolocation();
            onChange(pos.latitude, pos.longitude);
        } catch (err: any) {
            alert(err?.message || "Impossible de récupérer votre position.");
        }
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
            <p className="text-[10px] text-zinc-400 text-center">
                Localisation optionnelle.
            </p>
        </div>
    );
}
