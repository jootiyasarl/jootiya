"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Sparkles, Image as ImageIcon } from "lucide-react";
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* 1. Square Image Container (aspect-square with rounded-2xl) */}
      <figure className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-t-2xl shrink-0 m-0">
        <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
          <span className="sr-only">Voir l&apos;annonce {ad.title}</span>
        </Link>

        {ad.imageUrl && !imgFailed ? (
          <img
            src={getOptimizedImageUrl(ad.imageUrl, { width: 500, quality: 80, format: "webp" })}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImgFailed(true)}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400">
            <ImageIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-1" />
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Sans Photo</span>
          </div>
        )}

        {/* Floating Heart / Favorite Button with backdrop-blur-md */}
        <div className="absolute right-2 top-2 z-20">
          <FavoriteButton
            adId={ad.id}
            className="h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/50 dark:border-zinc-700/60 shadow-xs flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 transition-transform active:scale-90 hover:scale-105"
          />
        </div>

        {/* Featured / À la une Badge */}
        {ad.isFeatured && (
          <div className="absolute top-2 left-2 z-20 pointer-events-none">
            <Badge className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border-none shadow-xs flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              À la une
            </Badge>
          </div>
        )}

        {/* Sold Overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="rotate-[-12deg] rounded-xl border-2 border-white px-4 py-1 text-sm font-black tracking-tight text-white shadow-lg">
              VENDU
            </div>
          </div>
        )}
      </figure>

      {/* 2. Details Section Below Image */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-1.5">
        <div className="flex flex-col gap-1">
          {/* Title - Single line clamped with neutral typography */}
          <Link href={linkHref} className="block group/link">
            <h3 className="line-clamp-1 text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors">
              {ad.title}
            </h3>
          </Link>

          {/* Price - Bold and distinct */}
          <div className="mt-0.5">
            <span className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white tracking-tight">
              {ad.price}
            </span>
          </div>
        </div>

        {/* Location & Relative Date - Subtle small subtext */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-normal pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60 mt-auto">
          <div className="inline-flex items-center gap-1 min-w-0 max-w-[62%]">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span className="truncate">{ad.location}</span>
          </div>
          <div className="inline-flex items-center gap-1 shrink-0">
            <Clock3 className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
            <span>{ad.createdAt || "Aujourd'hui"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Skeleton Loader matching the exact Product Card layout
 * Uses animate-pulse to completely eliminate CLS (Cumulative Layout Shift)
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square w-full bg-zinc-200 dark:bg-zinc-800 rounded-t-2xl" />
      <div className="p-2.5 sm:p-3 flex flex-col gap-2 flex-1">
        <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-4/5" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-2/5" />
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-auto">
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3" />
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive Grid Skeleton
 * 2 columns on mobile, 3 to 5 columns on tablet, desktop, and large displays
 */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
