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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-200/10 dark:shadow-none hover:shadow-2xl hover:shadow-zinc-200/20 dark:hover:shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]">
      {/* Thumbnail area with 4:3 aspect ratio */}
      <figure className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 m-0">
        <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
          <span className="sr-only">Voir l&apos;annonce {ad.title}</span>
        </Link>

        {ad.imageUrl && !imgFailed ? (
          <img
            src={getOptimizedImageUrl(ad.imageUrl, { width: 600, quality: 80, format: "webp" })}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImgFailed(true)}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-400">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Sans Photo</span>
          </div>
        )}

        {/* Floating Heart / Favorite Button */}
        <div className="absolute right-3 top-3 z-30">
          <FavoriteButton
            adId={ad.id}
            className="h-9 w-9 rounded-full bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-red-500 backdrop-blur-md shadow-lg border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          />
        </div>

        {/* Featured / À la une Badge */}
        {ad.isFeatured && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <Badge variant="orange" className="text-[10px] sm:text-[11px] font-black tracking-tight">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
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
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
        <div className="flex flex-col gap-2">
          <Link href={linkHref} className="block group/link">
            <h3 className="line-clamp-2 min-h-[2.75rem] text-sm sm:text-base font-extrabold leading-snug text-zinc-900 dark:text-zinc-100 group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors">
              {ad.title}
            </h3>
          </Link>

          {/* Price */}
          <p className="text-lg sm:text-xl font-black tracking-tight text-orange-600 dark:text-orange-500">
            {ad.price}
          </p>
        </div>

        {/* Location & Relative Time Footer */}
        <div className="flex flex-col gap-1.5 text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{ad.location}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{ad.createdAt || "Aujourd'hui"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
