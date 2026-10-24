"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";
import type { PublicAdCardAd } from "@/components/AdCard";

export function HomeAdCard({ ad, priority = false }: { ad: PublicAdCardAd; priority?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = `/ads/${ad.id}/${adSlug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 dark:hover:shadow-zinc-950/50 hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]">
      {/* Thumbnail area with 4:3 aspect ratio */}
      <figure className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 m-0">
        <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
          <span className="sr-only">Voir l&apos;annonce {ad.title}</span>
        </Link>

        {ad.imageUrl && !imgFailed ? (
          <img
            src={getOptimizedImageUrl(ad.imageUrl, { width: 600, quality: 80, format: "webp" })}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImgFailed(true)}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 text-zinc-400">
            <span className="text-2xl mb-1 opacity-60">📷</span>
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Sans Photo</span>
          </div>
        )}

        {/* Floating Heart / Favorite Button */}
        <div className="absolute right-2.5 top-2.5 z-30">
          <FavoriteButton
            adId={ad.id}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-red-500 backdrop-blur-md shadow-md border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          />
        </div>

        {/* Featured / À la une Badge */}
        {ad.isFeatured && (
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
            <Badge variant="orange" className="text-[10px] sm:text-[11px] font-black tracking-tight shadow-md shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none px-2.5 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              À la une
            </Badge>
          </div>
        )}

        {/* Sold Overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="rotate-[-12deg] rounded-2xl border-4 border-white px-6 py-2 text-2xl font-black tracking-tighter text-white shadow-2xl">
              VENDU
            </div>
          </div>
        )}
      </figure>

      {/* Card Details Body */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div className="flex flex-col gap-1.5">
          <Link href={linkHref} className="block group/link">
            <h3 className="line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-100 group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors">
              {ad.title}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black tracking-tight text-orange-600 dark:text-orange-500">
              {ad.price}
            </span>
          </div>
        </div>

        {/* Location & Relative Time Footer */}
        <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="inline-flex items-center gap-1 min-w-0 max-w-[60%]">
            <MapPin className="h-3 w-3 shrink-0 text-orange-500/80" />
            <span className="truncate">{ad.location}</span>
          </div>
          <div className="inline-flex items-center gap-1 shrink-0">
            <Clock3 className="h-3 w-3 text-zinc-400" />
            <span>{ad.createdAt || "Récemment"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
