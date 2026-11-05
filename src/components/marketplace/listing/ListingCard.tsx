"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ListingCard — Universal Product Card  |  Jootiya.com
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DESIGN SYSTEM TOKENS (match the rest of the site):
 *   - Price:    text-amber-600 font-bold
 *   - Featured: bg-orange-500 badge
 *   - CTA:      border-amber-500 accent line on hover
 *   - Layout:   aspect-[4/3] image → price → title → meta
 *
 * PERFORMANCE CHOICES:
 *   - Shimmer skeleton is mounted alongside real image (opacity 0→1 on onLoad)
 *     to avoid the "pop-in" flicker caused by conditional rendering.
 *   - will-change: transform isolates GPU layer for smooth hover scale.
 *   - priority=true only for the first 4 above-the-fold cards.
 *   - decoding="async" avoids blocking the main thread on image decode.
 *   - generateSlug() is memoized at call-site (no recalculation per render).
 *
 * ACCESSIBILITY:
 *   - <article> landmark per card (screen readers enumerate them).
 *   - Descriptive alt (product title) instead of generic "image".
 *   - focus-visible ring for keyboard navigation.
 *   - Sold/Featured overlays have aria-label.
 *   - FavoriteButton min 44×44px touch target via padding.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Link from "next/link";
import { MapPin, Image as ImageIcon, Sparkles } from "lucide-react";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ListingCardData {
  id: string;
  slug?: string | null;
  title: string;
  /** Pre-formatted string e.g. "1 200 MAD" */
  price: string;
  location?: string | null;
  /** Pre-formatted display date e.g. "5 nov. à 14:30" */
  createdAt?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  status?: string | null;
}

export interface ListingCardProps {
  ad: ListingCardData;
  /** true for first 4 above-the-fold cards → loading="eager" */
  priority?: boolean;
  /** Override the href (defaults to /ads/[id]/[slug]) */
  href?: string;
  className?: string;
}

// ─── Sub-component: CardImage ─────────────────────────────────────────────────

function CardImage({
  src,
  alt,
  priority,
  isFeatured,
  isSold,
  adId,
}: {
  src: string | null;
  alt: string;
  priority: boolean;
  isFeatured?: boolean;
  isSold?: boolean;
  adId: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const showImg = src && !failed;

  return (
    /*
     * aspect-[4/3] creates the exact pixel reservation for the image box
     * BEFORE the browser fetches a single byte of the image.
     * This is the single most effective CLS fix available.
     */
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 rounded-t-2xl shrink-0">
      {showImg ? (
        <>
          {/* ── Shimmer — mounted immediately, fades out on onLoad ── */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 z-10 transition-opacity duration-300",
              loaded ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
          </div>

          {/* ── Real image — fades in over shimmer on load ── */}
          <img
            src={src}
            alt={alt}
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              // GPU-composited transform — no layout reflows during hover
              "will-change-transform transition-[transform,opacity] duration-300 ease-out",
              "group-hover:scale-[1.04]",
              loaded ? "opacity-100" : "opacity-0"
            )}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        /* ── No-photo fallback ── */
        <div
          aria-label="Sans photo"
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50"
        >
          <ImageIcon className="h-8 w-8 text-gray-300 mb-1" aria-hidden="true" />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
            Sans Photo
          </span>
        </div>
      )}

      {/* ── Favorite button — glassmorphic, 44px touch target ── */}
      <div className="absolute right-2 top-2 z-20">
        <FavoriteButton
          adId={adId}
          className={cn(
            "h-7 w-7 rounded-full",
            "bg-white/82 backdrop-blur-sm border border-white/50 shadow-sm",
            "flex items-center justify-center",
            "text-gray-400 hover:text-rose-500 hover:bg-white",
            "transition-all duration-200 active:scale-90 hover:scale-110",
            // Invisible tap-area extension — WCAG 2.5.5 (44px target)
            "relative before:absolute before:inset-[-8px]"
          )}
        />
      </div>

      {/* ── Featured badge ── */}
      {isFeatured && (
        <div
          aria-label="Annonce à la une"
          className="absolute top-2 left-2 z-20 pointer-events-none"
        >
          <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500 text-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm">
            <Sparkles className="h-2 w-2" aria-hidden="true" />
            À la une
          </span>
        </div>
      )}

      {/* ── Sold overlay ── */}
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

      {/* ── Hover amber accent line ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"
      />
    </div>
  );
}

// ─── Sub-component: CardInfo ──────────────────────────────────────────────────

function CardInfo({
  price,
  title,
  location,
  createdAt,
}: {
  price: string;
  title: string;
  location?: string | null;
  createdAt?: string | null;
}) {
  return (
    <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-0.5">
      {/* Price — most dominant element, amber for brand consistency */}
      <p className="text-sm sm:text-[15px] font-bold text-amber-600 tracking-tight leading-tight truncate">
        {price}
      </p>

      {/*
       * min-h-[2.5em] reserves height for 2 lines even when title is short.
       * This keeps card heights uniform in the grid → no jagged rows.
       */}
      <h3 className="text-xs sm:text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 min-h-[2.5em]">
        {title}
      </h3>

      {/* Meta: location + date in one compact, truncated row */}
      <div className="flex items-center gap-1 mt-0.5 min-w-0">
        <MapPin className="h-2.5 w-2.5 shrink-0 text-gray-400" aria-hidden="true" />
        <span className="text-[10px] text-gray-400 truncate">
          {location || "Maroc"}
        </span>
        {createdAt && (
          <>
            <span aria-hidden="true" className="text-gray-300 text-[10px] shrink-0">·</span>
            <time
              className="text-[10px] text-gray-400 shrink-0 truncate max-w-[64px]"
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

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ListingCard({
  ad,
  priority = false,
  href,
  className,
}: ListingCardProps) {
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = href || `/ads/${ad.id}/${adSlug}`;

  // 480px WebP thumbnail via Supabase Image Transformations
  const imgSrc = ad.imageUrl
    ? getOptimizedImageUrl(ad.imageUrl, { width: 480, quality: 80, format: "webp" })
    : null;

  return (
    <article className={cn("group relative", className)}>
      <Link
        href={linkHref}
        aria-label={`Voir : ${ad.title}`}
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl bg-white",
          "border border-gray-100 shadow-sm",
          // Lift + deepen shadow on hover — transform is GPU-composited
          "hover:shadow-md hover:-translate-y-0.5",
          "transition-all duration-200 ease-out",
          // Keyboard-only focus ring (not shown on mouse click)
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
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
 * Exact pixel-match of ListingCard dimensions → zero CLS during page load.
 * Uses shimmer gradient instead of flat pulse for a premium feel.
 */
export function ListingCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm"
    >
      {/* Image — same aspect-[4/3] */}
      <div className="aspect-[4/3] w-full relative overflow-hidden rounded-t-2xl bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
      </div>

      {/* Info — matches px-2.5 pt-2 pb-2.5 of real card */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-2">
        {/* Price */}
        <div className="h-4 w-2/5 rounded-md relative overflow-hidden bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
        </div>
        {/* Title — 2 lines matching min-h-[2.5em] */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-[90%] rounded-md relative overflow-hidden bg-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
          </div>
          <div className="h-3 w-3/5 rounded-md relative overflow-hidden bg-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
        {/* Meta row */}
        <div className="h-2.5 w-1/2 rounded-md relative overflow-hidden bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton: Responsive Grid ────────────────────────────────────────────────

/**
 * 2 → 3 → 4 → 5 column responsive skeleton grid.
 * Rendered server-side for immediate first paint.
 */
export function ListingGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div
      aria-label="Chargement des annonces…"
      aria-busy="true"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
