"use client";

import dynamicImport from "next/dynamic";

export const AdLocationMapDynamic = dynamicImport(
  () => import("@/components/ads/AdLocationMap").then((mod) => mod.AdLocationMap),
  { 
    ssr: false, 
    loading: () => <div className="h-[400px] w-full bg-zinc-100 animate-pulse rounded-2xl flex items-center justify-center text-zinc-400 text-xs font-bold uppercase tracking-widest">Chargement de la carte...</div> 
  }
);
