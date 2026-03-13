"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Dynamically import the entire LeafletMap component to avoid SSR issues
const LeafletMap = dynamic(() => import("./LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-100 animate-pulse flex items-center justify-center text-zinc-400 text-xs font-bold">Chargement de la carte...</div>
});

interface AdLocationMapProps {
    lat: number;
    lng: number;
    city?: string;
    neighborhood?: string;
}

export function AdLocationMap({ lat, lng, city, neighborhood }: AdLocationMapProps) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-md shadow-zinc-200/50 border border-zinc-100 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <span className="h-8 w-1.5 rounded-full bg-orange-600" />
                    Emplacement de l'article
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
                    zoom={13}
                    radius={1000}
                />
            </div>
        </div>
    );
}
