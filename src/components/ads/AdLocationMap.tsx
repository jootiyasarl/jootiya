"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserGeolocation } from "@/lib/adLocation";
import { toast } from "sonner";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });

interface AdLocationMapProps {
    lat: number;
    lng: number;
    city?: string;
    neighborhood?: string;
}

/**
 * Haversine formula to calculate distance between two points in km
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function AdLocationMap({ lat, lng, city, neighborhood }: AdLocationMapProps) {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

    useEffect(() => {
        // Only load Leaflet CSS on the client
        if (typeof window !== "undefined") {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
            setIsLeafletLoaded(true);
        }
    }, []);

    const handleCalculateDistance = async () => {
        if (!showExplanation) {
            setShowExplanation(true);
            return;
        }

        setIsRequesting(true);
        try {
            const pos = await getBrowserGeolocation();
            const dist = calculateDistance(pos.latitude, pos.longitude, lat, lng);
            setUserLocation({ lat: pos.latitude, lng: pos.longitude });
            setDistance(dist);
            toast.success("تم حساب المسافة بنجاح");
            setShowExplanation(false);
        } catch (error: any) {
            toast.error(error.message || "فشل الحصول على الموقع");
        } finally {
            setIsRequesting(false);
        }
    };

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    return (
        <div className="rounded-3xl bg-white p-6 shadow-md shadow-zinc-200/50 border border-zinc-100 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <span className="h-8 w-1.5 rounded-full bg-orange-600" />
                    موقع السلعة
                </h2>
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors uppercase tracking-wider"
                >
                    Google Maps <ExternalLink className="h-3 w-3" />
                </a>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="font-medium text-zinc-700">{city}</span>
                {neighborhood && (
                    <>
                        <span className="text-zinc-300">•</span>
                        <span className="text-zinc-600">{neighborhood}</span>
                    </>
                )}
            </div>

            {/* Map Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 group">
                {isLeafletLoaded && (
                    <MapContainer
                        center={[lat, lng]}
                        zoom={13}
                        scrollWheelZoom={false}
                        className="h-full w-full z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Privacy Circle instead of Marker */}
                        <Circle
                            center={[lat, lng]}
                            pathOptions={{ fillColor: '#ea580c', color: '#ea580c', fillOpacity: 0.1, weight: 1 }}
                            radius={800} // ~800m radius for privacy
                        />
                    </MapContainer>
                )}

                {/* Clickable Overlay for External Link */}
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5"
                >
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-zinc-900 border border-white">
                        <Navigation className="w-4 h-4 text-orange-500" />
                        فتح في الخرائط
                    </div>
                </a>
            </div>

            {/* Geolocation Section */}
            <div className="space-y-4">
                {!distance ? (
                    <div className="space-y-3">
                        {showExplanation ? (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-orange-600 shrink-0" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-orange-900 leading-relaxed">
                                            سوف نستخدم موقعك الحالي فقط لحساب المسافة بينك وبين البائع. لن يتم حفظ موقعك أو مشاركته مع أي شخص.
                                        </p>
                                        <Button
                                            onClick={handleCalculateDistance}
                                            disabled={isRequesting}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100"
                                        >
                                            {isRequesting ? "جاري التحديد..." : "موافق، ابدأ الحساب"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={handleCalculateDistance}
                                variant="outline"
                                className="w-full h-12 rounded-2xl border-dashed border-zinc-200 text-zinc-600 hover:text-orange-600 hover:border-orange-200 transition-all font-bold gap-2"
                            >
                                <Navigation className="w-4 h-4" />
                                شحال بعيدة علي؟
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Navigation className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">المسافة التقريبية</div>
                                <div className="text-lg font-black text-emerald-900">
                                    {distance.toFixed(1)} كم <span className="text-sm font-normal text-emerald-700/60">عليك</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-emerald-600 font-bold bg-white px-3 py-1 rounded-full shadow-sm">
                            موقع تقريبي
                        </div>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-zinc-400 text-center leading-tight">
                * يتم عرض موقع تقريبي للسلعة في شعاع 800 متر لضمان خصوصية البائع.
            </p>
        </div>
    );
}
