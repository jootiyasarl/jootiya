"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation, MapPin } from "lucide-react";
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
import { toast } from "sonner";
import { getBrowserGeolocation } from "@/lib/adLocation";

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
    const [permissionDenied, setPermissionDenied] = useState(false);

    const handleLocateAndFilter = async () => {
        setIsLocating(true);
        setPermissionDenied(false); // Reset
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

            if (msg.toLowerCase().includes("refusé") || msg.toLowerCase().includes("denied")) {
                setPermissionDenied(true);
            }
        } finally {
            setIsLocating(false);
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
            // If no location yet, try to locate
            handleLocateAndFilter();
        }
    };

    const isLocationActive = !!searchParams.get("lat");

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 min-w-[60px] text-zinc-600 hover:text-orange-600 active:scale-95 transition-all">
                    <div className={`p-2 rounded-full ${isLocationActive ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold">Radar</span>
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
                        {/* Radius Slider */}
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

                        {/* Permission Help Text */}
                        {permissionDenied && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <p className="font-bold flex items-center gap-2">
                                    <span className="text-lg">🔒</span> Accès bloqué ?
                                </p>
                                <p className="text-xs text-red-500 leading-relaxed">
                                    Votre navigateur bloque la localisation. <br />
                                    1. Cliquez sur le <strong>cadenas (🔒)</strong> ou paramètres dans la barre d'adresse.<br />
                                    2. Sélectionnez <strong>"Autorisations"</strong>.<br />
                                    3. Activez la <strong>Localisation</strong> et réessayez.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {!isLocationActive ? (
                                <Button
                                    onClick={handleLocateAndFilter}
                                    disabled={isLocating}
                                    className="w-full bg-zinc-900 hover:bg-black text-white h-12 rounded-xl font-bold shadow-lg"
                                >
                                    {isLocating ? "Localisation..." : (
                                        <>
                                            <Navigation className="w-4 h-4 mr-2" />
                                            Activer ma position
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleApply}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-orange-200"
                                >
                                    Appliquer filtre ({radius[0]} km)
                                </Button>
                            )}

                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full rounded-xl h-11 border-zinc-200">
                                    Annuler
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
