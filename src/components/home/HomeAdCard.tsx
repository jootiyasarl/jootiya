"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HomeAdCard — Production-Grade Listing Card  |  Jootiya.com
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ARCHITECTURAL DECISIONS
 * ───────────────────────
 * 1. CLS Prevention (Core Web Vital):
 *    - `aspect-[4/3]` on the image wrapper reserves the exact pixel space
 *      before the image loads. This eliminates layout shift entirely.
 *    - `object-cover` + `absolute inset-0` fills the reserved box without
 *      distorting any image regardless of original aspect ratio.
 *
 * 2. Shimmer Skeleton (Zero Flicker):
 *    - `imgLoaded` state tracks the native `onLoad` event.
 *    - Skeleton and real image are mounted simultaneously; the skeleton
 *      fades out via CSS opacity transition once the image is ready.
 *      This avoids the "pop-in" effect common with conditional rendering.
 *
 * 3. Single Responsibility:
 *    - <CardImage />     → image + skeleton + fallback + overlays
 *    - <CardInfo />      → price + title + meta row
 *    - <HomeAdCard />    → orchestration + link wrapper
 *    - <ProductCardSkeleton /> → pure loading state (no image fetch)
 *    - <ProductGridSkeleton /> → responsive grid of skeletons
 *
 * 4. Accessibility:
 *    - <article> landmark for each card (screen reader lists)
 *    - `aria-label` on the main link for context
 *    - FavoriteButton has its own title/aria-label
 *    - `alt` text is the product title (descriptive, not generic)
 *    - Minimum 44×44px touch target on the heart button
 *
 * 5. Performance:
 *    - `loading="eager"` only for the first 4 above-the-fold cards.
 *    - `decoding="async"` releases the main thread during image decode.
 *    - `getOptimizedImageUrl` generates 480px WebP thumbnails via
 *      Supabase Image Transformations (or falls back to original URL).
 *    - `will-change: transform` on the image for GPU-composited scale.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Link from "next/link";
import { MapPin, Image as ImageIcon, Sparkles } from "lucide-react";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";
import type { PublicAdCardAd } from "@/components/AdCard";
import { cn } from "@/lib/utils";

// ─── Sub-component: Image Area ────────────────────────────────────────────────

interface CardImageProps {
  src: string | null;
  alt: string;
  priority: boolean;
  isFeatured?: boolean;
  isSold?: boolean;
  adId: string;
}

function CardImage({ src, alt, priority, isFeatured, isSold, adId }: CardImageProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const showImage = src && !imgFailed;

  return (
    /**
     * aspect-[4/3] reserves height before image loads → zero CLS.
     * overflow-hidden clips the scale(1.05) hover effect cleanly.
     */
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 rounded-t-xl shrink-0">

      {showImage ? (
        <>
          {/* ── Shimmer skeleton — visible until image fully loads ── */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 z-10 transition-opacity duration-300",
              imgLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
          </div>

          {/* ── Real image — fades in over the skeleton ── */}
          <img
            src={src}
            alt={alt}
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              // GPU-composited transform for smooth hover scale (no repaints)
              "transition-[transform,opacity] duration-300 ease-out will-change-transform",
              "group-hover:scale-[1.04]",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
          />
        </>
      ) : (
        /* ── No-photo fallback ── */
        <div
          aria-label="Sans photo"
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100"
        >
          <ImageIcon className="h-7 w-7 text-gray-300 mb-1" aria-hidden="true" />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
            Sans Photo
          </span>
        </div>
      )}

      {/* ── Glassmorphic Favorite button — 44×44px touch target ── */}
      <div className="absolute right-1.5 top-1.5 z-20">
        <FavoriteButton
          adId={adId}
          className={cn(
            "h-7 w-7 rounded-full",
            "bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm",
            "flex items-center justify-center",
            "text-gray-500 hover:text-rose-500 hover:bg-white",
            "transition-all duration-200 active:scale-90 hover:scale-110",
            // Minimum 44px touch target via pseudo-element (no layout impact)
            "relative before:absolute before:inset-[-8px]"
          )}
        />
      </div>

      {/* ── Featured badge — only when isFeatured is true ── */}
      {isFeatured && (
        <div
          aria-label="Annonce à la une"
          className="absolute top-1.5 left-1.5 z-20 pointer-events-none"
        >
          <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500 text-white px-1.5 py-0.5 text-[9px] font-bold shadow-sm uppercase tracking-wide">
            <Sparkles className="h-2 w-2" aria-hidden="true" />
            À la une
          </span>
        </div>
      )}

      {/* ── Sold overlay — full-card dim + rotated stamp ── */}
      {isSold && (
        <div
          aria-label="Article vendu"
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[1.5px]"
        >
          <span className="rotate-[-12deg] rounded-xl border-2 border-white px-4 py-1 text-xs font-black tracking-widest text-white shadow-lg uppercase select-none">
            Vendu
          </span>
        </div>
      )}

      {/* ── Amber accent line — slides in from left on hover ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"
      />
    </div>
  );
}

// ─── Sub-component: Info Area ─────────────────────────────────────────────────

interface CardInfoProps {
  price: string;
  title: string;
  location?: string;
  createdAt?: string;
}

function CardInfo({ price, title, location, createdAt }: CardInfoProps) {
  return (
    <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1">
      {/* Price — bold dark like OLX, most dominant element */}
      <p className="text-[15px] sm:text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight truncate">
        {price}
      </p>

      {/**
       * Title — 2-line clamp with min-height reserves space even when
       * title is very short, keeping card heights consistent in the grid.
       */}
      <h3 className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300 leading-snug line-clamp-2 min-h-[2.5em]">
        {title}
      </h3>

      {/* Meta row: location + date in a single compact line */}
      <div className="flex items-center gap-1 mt-0.5 min-w-0">
        <MapPin className="h-3 w-3 shrink-0 text-zinc-400" aria-hidden="true" />
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
          {location || "Maroc"}
        </span>
        {createdAt && (
          <>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600 text-[11px]">·</span>
            <time
              className="text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0 truncate max-w-[72px]"
              suppressHydrationWarning
            >
              {createdAt}
            </time>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Export: HomeAdCard ──────────────────────────────────────────────────

export function HomeAdCard({
  ad,
  priority = false,
}: {
  ad: PublicAdCardAd;
  priority?: boolean;
}) {
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = `/ads/${ad.id}/${adSlug}`;

  const imgSrc = ad.imageUrl
    ? getOptimizedImageUrl(ad.imageUrl, { width: 480, quality: 80, format: "webp" })
    : null;

  return (
    /**
     * <article> gives screen readers a named landmark.
     * `group` enables group-hover utilities on child elements.
     * hover:-translate-y-0.5 creates a subtle "lift" effect without
     * triggering layout reflow (transform is GPU-composited).
     */
    <article className="group relative">
      <Link
        href={linkHref}
        aria-label={`Voir l'annonce : ${ad.title}`}
        className={cn(
          "flex flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900",
          "border border-zinc-200/80 dark:border-zinc-800",
          "hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5",
          "transition-all duration-200 ease-out",
          // Outline only on keyboard focus (not mouse click)
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        )}
      >
        <CardImage
          src={imgSrc}
          alt={ad.title}
          priority={priority}
          isFeatured={ad.isFeatured}
          isSold={ad.status === "sold"}
          adId={ad.id}
        />
        <CardInfo
          price={ad.price}
          title={ad.title}
          location={ad.location}
          createdAt={ad.createdAt}
        />
      </Link>
    </article>
  );
}

// ─── Skeleton: Single Card ────────────────────────────────────────────────────

/**
 * Matches the exact dimensions of HomeAdCard to prevent CLS during load.
 * Uses shimmer animation instead of a flat pulse for a premium feel.
 */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800"
    >
      {/* Image area — same aspect ratio as real card */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-200 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
      </div>

      {/* Info area — matches px-3 pt-2.5 pb-3 of real card */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1.5">
        {/* Price line */}
        <div className="h-4 w-2/5 rounded-md bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
        </div>
        {/* Title — 2 lines matching min-h-[2.5em] */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-[90%] rounded-md bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
          </div>
          <div className="h-3 w-3/5 rounded-md bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
        {/* Location row */}
        <div className="h-2.5 w-1/2 rounded-md bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton: Responsive Grid ────────────────────────────────────────────────

/**
 * Responsive grid of skeletons: 2 → 3 → 4 → 5 columns.
 * Rendered server-side for immediate paint before JS hydrates.
 */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div
      aria-label="Chargement des annonces…"
      aria-busy="true"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
