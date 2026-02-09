"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Navigation, Compass, MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getBrowserGeolocation } from "@/lib/adLocation";

// Helper type matching MultiMarkerMap props
import { AdMarker } from "./MultiMarkerMap";

const MultiMarkerMap = dynamic(() => import("./MultiMarkerMap"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-zinc-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-zinc-400">Chargement de la carte...</div>
});

interface SidebarProps {
    ads: AdMarker[];
}

export function LocationFilterSidebar({ ads }: SidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const radiusParam = searchParams.get("radius");
    const parsedRadius = radiusParam ? parseInt(radiusParam) : 50;
    const initialRadius = isNaN(parsedRadius) ? 50 : parsedRadius;
    const [radius, setRadius] = useState([initialRadius]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Initialize location from URL if present
    useEffect(() => {
        const latStr = searchParams.get("lat");
        const lngStr = searchParams.get("lng");

        if (latStr && lngStr) {
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            if (!isNaN(lat) && !isNaN(lng)) {
                setUserLocation({ lat, lng });
            }
        }
    }, [searchParams]);

    const handleLocateAndFilter = async () => {
        setIsLocating(true);
        try {
            const pos = await getBrowserGeolocation();
            setUserLocation({ lat: pos.latitude, lng: pos.longitude });

            // Update URL to trigger server fetch
            const params = new URLSearchParams(searchParams.toString());
            params.set("lat", pos.latitude.toString());
            params.set("lng", pos.longitude.toString());
            // Default to 5km when first locating if radius is very large (default)
            if (radius[0] > 20) {
                setRadius([5]);
                params.set("radius", "5");
            } else {
                params.set("radius", radius[0].toString());
            }

            router.push(`/?${params.toString()}`);
            toast.success("Position détectée ! Recherche locale activée.");
        } catch (err: any) {
            toast.error("Impossible de récupérer votre position.");
            console.error(err);
        } finally {
            setIsLocating(false);
        }
    };

    const handleRadiusChange = (val: number[]) => {
        setRadius(val);
    };

    const handleRadiusCommit = (val: number[]) => {
        // Only update URL on commit (when user releases slider) to avoid spamming
        if (userLocation) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("lat", userLocation.lat.toString());
            params.set("lng", userLocation.lng.toString());
            params.set("radius", val[0].toString());
            router.push(`/?${params.toString()}`);
        } else {
            toast.info("Activez d'abord la localisation pour filtrer par distance.");
        }
    };

    // Center logic: User location > First valid ad location > Default (Casablanca)
    const getSafeCenter = (): [number, number] => {
        if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
            return [userLocation.lat, userLocation.lng];
        }
        if (ads.length > 0) {
            const firstWithCoords = ads.find(a => a.latitude && a.longitude);
            if (firstWithCoords) {
                return [firstWithCoords.latitude, firstWithCoords.longitude];
            }
        }
        return [33.5731, -7.5898]; // Casablanca
    };

    const mapCenter = getSafeCenter();
    const mapZoom = userLocation ? 13 : 10;

    return (
        <aside className="sticky top-24 space-y-6 hidden lg:block">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-orange-50 rounded-xl">
                        <Compass className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 leading-tight">Radar Jootiya</h3>
                        <p className="text-[11px] font-medium text-zinc-400">Offres à proximité</p>
                    </div>
                </div>

                {/* Map Preview */}
                <div className="h-[220px] w-full rounded-2xl overflow-hidden border border-zinc-100 mb-6 relative group">
                    <MultiMarkerMap
                        ads={ads}
                        center={mapCenter}
                        zoom={mapZoom}
                        userLocation={userLocation ? [userLocation.lat, userLocation.lng] : null}
                        radiusKm={radius[0]}
                    />
                    {!userLocation && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-[500] transition-opacity group-hover:bg-white/20">
                            <Button
                                size="sm"
                                onClick={handleLocateAndFilter}
                                disabled={isLocating}
                                className="bg-zinc-900 text-white hover:bg-black shadow-xl rounded-xl font-bold text-xs h-9 px-4"
                            >
                                {isLocating ? "Détection..." : (
                                    <>
                                        <Navigation className="w-3 h-3 mr-2" />
                                        Activer le Radar
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Radius Slider */}
                <div className={`space-y-4 transition-opacity duration-300 ${!userLocation ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rayon de recherche</label>
                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                            {radius[0]} km
                        </span>
                    </div>
                    <Slider
                        defaultValue={[50]}
                        value={radius}
                        max={50}
                        min={1}
                        step={1}
                        onValueChange={handleRadiusChange}
                        onValueCommit={handleRadiusCommit}
                        className="py-2"
                    />
                    <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                        Glissez pour voir les annonces jusqu'à <span className="text-zinc-700 font-bold">{radius[0]} km</span> autour de vous.
                    </p>
                </div>
            </div>

            {/* Promo Box / Tips */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-200">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-200 mt-1" />
                    <div>
                        <h4 className="font-bold text-sm mb-1">Astuce de Pro</h4>
                        <p className="text-xs text-orange-100 leading-relaxed opacity-90">
                            Activez le Radar pour trouver des "الهمزات" في حومتك قبل أن يراها الآخرون!
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
