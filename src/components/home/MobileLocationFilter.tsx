"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation, MapPin, Building2 } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { subscribeToTopic } from "@/lib/fcmTopic";
import { getBrowserGeolocation } from "@/lib/adLocation";
import { CITY_COORDINATES } from "@/lib/constants/cityCoordinates";

export function MobileLocationFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Radius state
    const radiusParam = searchParams.get("radius");
    const parsedRadius = radiusParam ? parseInt(radiusParam) : 5;
    const initialRadius = isNaN(parsedRadius) ? 5 : parsedRadius;
    const [radius, setRadius] = useState([initialRadius]);

    const [isLocating, setIsLocating] = useState(false);
    const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

    // Check permissions when drawer opens
    useEffect(() => {
        if (isOpen) {
            checkLocationPermission();
        }
    }, [isOpen]);

    const checkLocationPermission = async () => {
        if (!navigator.permissions || !navigator.permissions.query) return;

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            setPermissionState(result.state);

            if (result.state === 'granted') {
                // If already granted, just get location quietly
                if (!searchParams.get("lat")) {
                    handleLocateAndFilter();
                }
            } else if (result.state === 'denied') {
                // Show instructional UI
            }

            result.onchange = () => {
                setPermissionState(result.state);
            };
        } catch (error) {
            console.error("Permission check error:", error);
        }
    };

    const handleLocateAndFilter = async () => {
        setIsLocating(true);
        try {
            const pos = await getBrowserGeolocation();

            const params = new URLSearchParams(searchParams.toString());
            params.set("lat", pos.latitude.toString());
            params.set("lng", pos.longitude.toString());
            params.set("radius", radius[0].toString()); // Use current slider value or default 5

            router.push(`/?${params.toString()}`);
            toast.success("Position détectée !");
            setIsOpen(false);
        } catch (err: any) {
            console.error("Geolocation error:", err);
            const msg = err.message || "Impossible de récupérer votre position.";
            toast.error(msg);

            if (msg.toLowerCase().includes("refusé") || msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("access")) {
                setPermissionState('denied');
            }
        } finally {
            setIsLocating(false);
        }
    };

    const handleCitySelect = (value: string) => {
        // Find coordinates for the city
        const city = CITY_COORDINATES[value];
        if (city) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("lat", city.lat.toString());
            params.set("lng", city.lng.toString());
            params.set("radius", radius[0].toString());

            // Topic Subscription for Active Radar
            subscribeToTopic(`city_${value}`).then(success => {
                if (success) console.log(`Active Radar: Subscribed to ${value}`);
            });

            router.push(`/?${params.toString()}`);
            toast.success(`Radar activé sur ${value} !`);
            setIsOpen(false);
        }
    };

    const handleApply = () => {
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");

        if (lat && lng) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("radius", radius[0].toString());
            router.push(`/?${params.toString()}`);
            setIsOpen(false);
            toast.success(`Rayon de recherche: ${radius[0]} km`);
        } else {
            handleLocateAndFilter();
        }
    };

    const isLocationActive = !!searchParams.get("lat");
    const sortedCities = Object.keys(CITY_COORDINATES).sort();

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 min-w-[60px] text-zinc-600 hover:text-orange-600 active:scale-95 transition-all relative group">
                    <div className={`p-2 rounded-full transition-all ${isLocationActive ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200' : 'bg-zinc-100 text-zinc-500 group-hover:bg-orange-50'}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Radar</span>
                    {/* Pulse effect to tempt user if not active */}
                    {!isLocationActive && (
                        <span className="absolute top-1 right-2 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                    )}
                </button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                            <MapPin className="w-6 h-6 text-orange-500" />
                            Radar Jootiya
                        </DrawerTitle>
                        <DrawerDescription className="text-center">
                            Trouvez les bonnes affaires ("الهمزات") autour de vous.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 space-y-6">
                        {/* Radius Slider - Always visible if location active or as preview */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-zinc-700">Rayon de recherche</label>
                                <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                    {radius[0]} km
                                </span>
                            </div>
                            <Slider
                                value={radius}
                                max={50}
                                min={1}
                                step={1}
                                onValueChange={setRadius}
                                className="py-2"
                            />
                            <p className="text-xs text-center text-zinc-500">
                                Annonces à moins de <span className="font-bold text-zinc-900">{radius[0]} km</span> de votre position.
                            </p>
                        </div>

                        {/* Permission Help Text - Only if Denied */}
                        {permissionState === 'denied' && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <p className="font-bold flex items-center gap-2">
                                    <span className="text-lg">🔒</span> Accès bloqué ?
                                </p>
                                <p className="text-xs text-red-500 leading-relaxed">
                                    1. Cliquez sur le cadenas (🔒) en haut.<br />
                                    2. Activez la <strong>Localisation</strong>.<br />
                                    3. Ou choisissez une ville ci-dessous 👇
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            {isLocationActive ? (
                                <Button
                                    onClick={handleApply}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-orange-200"
                                >
                                    Appliquer filtre ({radius[0]} km)
                                </Button>
                            ) : (
                                <>
                                    {/* Primary Action - Hide if denied to avoid frustration */}
                                    {permissionState !== 'denied' && (
                                        <Button
                                            onClick={handleLocateAndFilter}
                                            disabled={isLocating}
                                            className="w-full bg-zinc-900 hover:bg-black text-white h-12 rounded-xl font-bold shadow-lg"
                                        >
                                            {isLocating ? "Localisation..." : (
                                                <>
                                                    <Navigation className="w-4 h-4 mr-2" />
                                                    📍 Activer ma position
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {permissionState !== 'denied' && (
                                        <div className="relative flex py-1 items-center">
                                            <div className="flex-grow border-t border-zinc-200"></div>
                                            <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-bold uppercase">OU</span>
                                            <div className="flex-grow border-t border-zinc-200"></div>
                                        </div>
                                    )}

                                    {/* City Fallback - Always visible if location inactive */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 ml-1">
                                            {permissionState === 'denied' ? "📍 Choisissez votre ville manuellement :" : "🏙️ Ou choisissez une ville :"}
                                        </label>
                                        <Select onValueChange={handleCitySelect}>
                                            <SelectTrigger className="w-full h-12 rounded-xl border-zinc-200 bg-white shadow-sm">
                                                <SelectValue placeholder="Sélectionner une ville..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px]">
                                                {sortedCities.map((city) => (
                                                    <SelectItem key={city} value={city}>
                                                        {city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            <DrawerClose asChild>
                                <Button variant="ghost" className="w-full rounded-xl h-11 text-zinc-500 hover:bg-zinc-100">
                                    Fermer
                                </Button>
                            </DrawerClose>
                        </div>
                    </div>
                    <DrawerFooter />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
