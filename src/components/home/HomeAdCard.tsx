"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Image as ImageIcon, Sparkles } from "lucide-react";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";
import type { PublicAdCardAd } from "@/components/AdCard";

/**
 * HomeAdCard — Production-ready listing card
 * Design: Avito.ma / OLX Morocco style
 *   - Square image (aspect-[4/3] for better product visibility)
 *   - Compact info section below: price (amber, bold) → title (1-line) → location (small gray)
 *   - Glassmorphic heart overlay (top-right)
 *   - Featured badge (top-left)
 *   - Sold overlay
 *   - Hover: scale image + shadow lift + amber bottom accent
 *   - ZERO emojis — lucide-react icons only
 */
export function HomeAdCard({ ad, priority = false }: { ad: PublicAdCardAd; priority?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = `/ads/${ad.id}/${adSlug}`;

  const imgSrc = ad.imageUrl
    ? getOptimizedImageUrl(ad.imageUrl, { width: 480, quality: 80, format: "webp" })
    : null;

  return (
    <Link
      href={linkHref}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out"
      aria-label={ad.title}
    >
      {/* ── Image Container ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 rounded-t-2xl shrink-0">
        {imgSrc && !imgFailed ? (
          <img
            src={imgSrc}
            alt={ad.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImgFailed(true)}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-300">
            <ImageIcon className="h-8 w-8 mb-1" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              Sans Photo
            </span>
          </div>
        )}

        {/* Glassmorphic Heart / Favorite Button — top-right */}
        <div className="absolute right-2 top-2 z-20">
          <FavoriteButton
            adId={ad.id}
            className="h-7 w-7 rounded-full bg-white/85 backdrop-blur-sm border border-white/60 shadow-sm flex items-center justify-center text-gray-500 hover:text-rose-500 hover:bg-white transition-all active:scale-90 hover:scale-110"
          />
        </div>

        {/* À la une badge — top-left */}
        {ad.isFeatured && (
          <div className="absolute top-2 left-2 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500 text-white px-2 py-0.5 text-[9px] font-bold shadow-sm uppercase tracking-wide">
              <Sparkles className="h-2.5 w-2.5" />
              À la une
            </span>
          </div>
        )}

        {/* Sold overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-[1px]">
            <div className="rotate-[-12deg] rounded-xl border-2 border-white px-4 py-1 text-sm font-black tracking-tight text-white shadow-lg uppercase">
              Vendu
            </div>
          </div>
        )}

        {/* Amber bottom accent on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />
      </div>

      {/* ── Info Section ── */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-0.5">
        {/* Price — amber, bold, prominent */}
        <p className="text-sm sm:text-[15px] font-bold text-amber-600 tracking-tight leading-tight">
          {ad.price}
        </p>

        {/* Title — 2-line clamp, dark gray */}
        <h3 className="text-xs sm:text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 min-h-[2.4em]">
          {ad.title}
        </h3>

        {/* Location — small muted row */}
        <div className="flex items-center gap-0.5 mt-0.5">
          <MapPin className="h-2.5 w-2.5 shrink-0 text-gray-400" />
          <span className="text-[10px] text-gray-400 truncate">
            {ad.location || "Maroc"}
          </span>
          {ad.createdAt && (
            <>
              <span className="text-gray-300 mx-1 text-[10px]">·</span>
              <span className="text-[10px] text-gray-400 shrink-0 truncate max-w-[60px]">
                {ad.createdAt}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Skeleton loader — matches exact card dimensions to prevent CLS
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse">
      {/* Image area */}
      <div className="aspect-[4/3] w-full bg-gray-200 rounded-t-2xl" />
      {/* Info area */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1.5">
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-3/5" />
        <div className="flex gap-1 mt-0.5">
          <div className="h-2.5 bg-gray-200 rounded w-1/4" />
          <div className="h-2.5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive grid skeleton — 2→3→4→5 columns
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
