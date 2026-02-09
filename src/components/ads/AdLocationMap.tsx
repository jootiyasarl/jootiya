"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserGeolocation } from "@/lib/adLocation";
import { toast } from "sonner";

// Dynamically import the entire LeafletMap component to avoid SSR issues
const LeafletMap = dynamic(() => import("./LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-100 animate-pulse flex items-center justify-center text-zinc-400 text-xs font-bold">جاري تحميل الخريطة...</div>
});

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
        <div className="rounded-3xl bg-white p-6 shadow-md shadow-zinc-200/50 border border-zinc-100 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <span className="h-8 w-1.5 rounded-full bg-orange-600" />
                    موقع السلعة
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    <MapPin className="h-3 w-3 text-orange-500" />
                    {city} {neighborhood ? `• ${neighborhood}` : ''}
                </div>
            </div>

            {/* Map Container - Slim & Modern (250px) */}
            <div className="relative h-[250px] w-full overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 group">
                <LeafletMap
                    center={[lat, lng]}
                    zoom={14}
                    radius={400} // Privacy radius
                />

                {/* Overlay Text for "Big Engineer" Context */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white/50 z-[400] max-w-[200px]">
                    <p className="text-[10px] font-bold text-zinc-600 leading-tight">
                        <span className="text-orange-600">⚠</span> موقع تقريبي (شعاع 400م)
                    </p>
                </div>
            </div>

            {/* Action Button: Open in Google Maps */}
            <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm gap-2 transition-all shadow-lg shadow-zinc-200 active:scale-[0.98]"
            >
                <img src="https://www.google.com/images/branding/product/ico/maps15_bnuw3a_32dp.ico" alt="Google Maps" className="w-5 h-5" />
                فتح في Google Maps
            </a>

            {/* Permission / Distance Calculation Section */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
                {!distance ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                        <div className="p-2.5 bg-white rounded-full shadow-sm border border-orange-100 shrink-0">
                            <Navigation className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-xs font-bold text-zinc-900">
                                شحال بعيدة عليك هاد السلعة؟
                            </p>
                            <p className="text-[11px] text-zinc-500 leading-relaxed">
                                وافق على مشاركة موقعك لنحسب لك المسافة والوقت المتبقي للوصول بدقة.
                            </p>
                        </div>
                        <Button
                            onClick={handleCalculateDistance}
                            disabled={isRequesting}
                            size="sm"
                            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-100 whitespace-nowrap px-6"
                        >
                            {isRequesting ? "جاري الحساب..." : "حسب المسافة"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                                <Navigation className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">المسافة</div>
                                <div className="text-base font-black text-emerald-900">
                                    {distance.toFixed(1)} كم <span className="text-xs font-medium text-emerald-700/60">عليك</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-zinc-400 text-center leading-tight pt-1">
                نحن نحترم خصوصية البائع، لذلك لا نظهر الموقع الدقيق إلا عند التواصل المباشر.
            </p>
        </div>
    );
}
