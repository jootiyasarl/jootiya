"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Sparkles } from "lucide-react";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";
import type { PublicAdCardAd } from "@/components/AdCard";

export function HomeAdCard({ ad, priority = false }: { ad: PublicAdCardAd; priority?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = `/ads/${ad.id}/${adSlug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-[1.35rem] border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]">
      {/* Thumbnail area with 4:3 aspect ratio */}
      <figure className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 m-0">
        <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
          <span className="sr-only">Voir l&apos;annonce {ad.title}</span>
        </Link>

        {ad.imageUrl && !imgFailed ? (
          <img
            src={getOptimizedImageUrl(ad.imageUrl, { width: 500, quality: 75, format: "webp" })}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImgFailed(true)}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sans Photo</span>
          </div>
        )}

        {/* Floating Heart / Favorite Button */}
        <div className="absolute right-2.5 top-2.5 z-30">
          <FavoriteButton
            adId={ad.id}
            className="h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-red-500 backdrop-blur-md shadow-sm border-0 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          />
        </div>

        {/* Featured / À la une Badge */}
        {ad.isFeatured && (
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-2.5 py-1 text-[9px] sm:text-[10px] font-black tracking-tight text-white shadow-md">
              <Sparkles className="h-3 w-3" />
              À la une
            </span>
          </div>
        )}

        {/* Sold Overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="rotate-[-12deg] rounded-xl border-4 border-white px-4 py-1.5 text-xl font-black tracking-tighter text-white shadow-2xl">
              VENDU
            </div>
          </div>
        )}
      </figure>

      {/* Card Details Body */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div className="flex flex-col gap-1.5">
          <Link href={linkHref} className="block group/link">
            <h3 className="line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-extrabold leading-snug text-zinc-900 dark:text-zinc-100 group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors">
              {ad.title}
            </h3>
          </Link>

          {/* Price */}
          <p className="text-base sm:text-lg font-black tracking-tight text-orange-600 dark:text-orange-500">
            {ad.price}
          </p>
        </div>

        {/* Location & Relative Time Footer */}
        <div className="flex flex-col gap-1 text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-auto pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="truncate">{ad.location}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <Clock3 className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="truncate">{ad.createdAt || "Aujourd'hui"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
