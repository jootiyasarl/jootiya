"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * InfiniteAdFeed — Client-Side Infinite Scroll for the Homepage
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ARCHITECTURAL DECISIONS
 * ───────────────────────
 * 1. SSR hydration-safe:
 *    Props accept `initialAds` (the first 12 fetched on the server).
 *    State is seeded from props so the first render matches the RSC HTML
 *    byte-for-byte — zero hydration mismatch.
 *
 * 2. IntersectionObserver sentinel pattern:
 *    A hidden <div ref={sentinelRef}> is placed at the bottom of the list.
 *    When it enters the viewport (rootMargin: "200px" pre-trigger zone),
 *    the observer fires and loads the next page. This is more efficient
 *    than scroll event listeners (no main-thread thrashing on every pixel).
 *    The observer is cleaned up in useEffect's return to prevent memory leaks.
 *
 * 3. Deduplication guard:
 *    `isFetchingRef` (a ref, not state) prevents double-fetch on rapid
 *    scroll. Using a ref avoids a stale closure problem that useState would
 *    cause inside the observer callback.
 *
 * 4. Staggered fade-in:
 *    New batches enter with a CSS translateY + opacity transition staggered
 *    per column index, giving a natural cascade feel without heavy libraries.
 *
 * 5. VirtualizedAdGrid is preserved for the initial SSR batch (above-fold).
 *    New pages are appended as a standard grid below — virtualization of an
 *    ever-growing list is complex and not needed once cards are already painted.
 *    The VirtualizedAdGrid handles the top segment; appended batches use a
 *    lightweight CSS grid.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { HomeAdCard, ProductCardSkeleton } from "@/components/home/HomeAdCard";
import { VirtualizedAdGrid } from "@/components/ads/VirtualizedAdGrid";
import { AdUnit } from "@/components/ads/AdUnit";
import type { HomepageAdRow } from "@/components/home/HomeClient";
import type { PublicAdCardAd } from "@/components/AdCard";
import { generateSlug } from "@/lib/seo-utils";
import { Package, Loader2 } from "lucide-react";

// ─── Type Helpers ─────────────────────────────────────────────────────────────

/** Shape returned by /api/ads */
interface AdsApiResponse {
  ads: HomepageAdRow[];
  hasMore: boolean;
  page: number;
  limit: number;
}

// ─── Data Transformer (identical to mapHomepageAdRow in HomeClient) ───────────

function rowToCardAd(row: HomepageAdRow): PublicAdCardAd {
  const locationParts: string[] = [];
  if (row.neighborhood) locationParts.push(row.neighborhood);
  if (row.city) locationParts.push(row.city);
  const location = locationParts.join(", ") || "Maroc";

  let createdAtLabel: string | undefined;
  if (row.created_at) {
    const d = new Date(row.created_at);
    if (!Number.isNaN(d.getTime())) {
      createdAtLabel = d.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      });
    }
  }

  const images = row.image_urls ?? (row as unknown as { images?: string[] }).images;
  const imageUrl =
    Array.isArray(images) && images.length > 0
      ? (images[0] as string)
      : undefined;

  const currency =
    typeof row.currency === "string" ? row.currency.trim() : "MAD";
  const price =
    row.price != null ? `${row.price} ${currency}` : "—";

  return {
    id: row.id,
    slug: generateSlug(row.title),
    title: row.title,
    price,
    location,
    createdAt: createdAtLabel,
    isFeatured: Boolean(row.is_featured),
    sellerBadge: row.is_featured ? "À la une" : undefined,
    imageUrl,
    status: row.status ?? undefined,
  };
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function BatchSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      aria-label="Chargement d'annonces supplémentaires…"
      aria-busy="true"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 mt-2.5 sm:mt-3 md:mt-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Fade-in wrapper for each appended batch ──────────────────────────────────

function FadeInBatch({
  ads,
  startIndex,
}: {
  ads: PublicAdCardAd[];
  startIndex: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger fade-in on the next animation frame so CSS transition fires
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 mt-2.5 sm:mt-3 md:mt-4"
    >
      {ads.map((ad, colIdx) => (
        <div
          key={ad.id}
          style={{
            transitionDelay: `${colIdx * 40}ms`,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            willChange: "opacity, transform",
          }}
        >
          <HomeAdCard ad={ad} priority={startIndex + colIdx < 4} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export interface InfiniteAdFeedProps {
  /**
   * First 12 ads fetched server-side (page 1). Rendered immediately by the
   * VirtualizedAdGrid — no fetch needed on mount.
   */
  initialAds: HomepageAdRow[];
  /** Pass-through: whether the SSR fetch returned fewer than 12 items */
  initialHasMore: boolean;
  /** Number of ads per batch (must match the API default). Default: 12 */
  pageSize?: number;
  /**
   * Optional: filter/sort that the parent (HomeClient) manages.
   * When activeFilter changes, the infinite feed resets to page 1.
   * Shape is an opaque string key — parent encodes its filter state here.
   */
  filterKey?: string;
  /** Forward virtualised grid props so layout stays consistent */
  emptyMessage?: string;
  emptySubtext?: string;
}

export function InfiniteAdFeed({
  initialAds,
  initialHasMore,
  pageSize = 12,
  filterKey = "",
  emptyMessage = "Aucune annonce trouvée",
  emptySubtext = "Modifiez vos critères ou revenez plus tard.",
}: InfiniteAdFeedProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  // Initial batch is handled by VirtualizedAdGrid — subsequent batches live here
  const [batches, setBatches] = useState<PublicAdCardAd[][]>([]);
  const [currentPage, setCurrentPage] = useState(1); // tracks *last fetched* page
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isFetchingState, setIsFetchingState] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Ref used INSIDE the observer callback to prevent stale closure on state
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(initialHasMore);
  const currentPageRef = useRef(1);

  // Keep refs in sync with state (observers capture refs, not state)
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // ── Reset when filter changes ─────────────────────────────────────────────
  useEffect(() => {
    // When parent changes category/city/sort, discard all appended batches
    // The parent re-fetches page 1 on the server — we just reset client state
    setBatches([]);
    setCurrentPage(1);
    setHasMore(initialHasMore);
    setFetchError(null);
    isFetchingRef.current = false;
    hasMoreRef.current = initialHasMore;
    currentPageRef.current = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // ── Fetch next page ───────────────────────────────────────────────────────
  const fetchNextPage = useCallback(async () => {
    // Guard: prevent concurrent fetches and halt when exhausted
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsFetchingState(true);
    setFetchError(null);

    const nextPage = currentPageRef.current + 1;

    try {
      const res = await fetch(
        `/api/ads?page=${nextPage}&limit=${pageSize}`,
        {
          // next: { revalidate: 30 } only works in Server Components;
          // here we use browser cache headers instead
          cache: "no-store", // always fresh — SSR cache is handled server-side
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json: AdsApiResponse = await res.json();
      const newCards = json.ads.map(rowToCardAd);

      setBatches((prev) => [...prev, newCards]);
      setCurrentPage(nextPage);
      setHasMore(json.hasMore);
      hasMoreRef.current = json.hasMore;
      currentPageRef.current = nextPage;
    } catch (err: unknown) {
      console.error("[InfiniteAdFeed] fetch error:", err);
      setFetchError("Erreur de chargement. Vérifiez votre connexion.");
    } finally {
      isFetchingRef.current = false;
      setIsFetchingState(false);
    }
  }, [pageSize]);

  // ── IntersectionObserver sentinel ─────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Fire immediately — guard inside fetchNextPage handles concurrency
          fetchNextPage();
        }
      },
      {
        // Pre-trigger 200px BEFORE the sentinel enters the viewport.
        // User never sees a blank gap — data arrives before they scroll to it.
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    // Cleanup on unmount — prevents memory leaks
    return () => observer.disconnect();
  }, [fetchNextPage]);

  // ── Map initial ads for the VirtualizedAdGrid ─────────────────────────────
  const initialCards = initialAds.map(rowToCardAd);

  // ── Empty state (no initial ads at all) ───────────────────────────────────
  if (initialCards.length === 0 && batches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 sm:p-14 text-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/60">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{emptyMessage}</h3>
        <p className="text-sm text-gray-500 max-w-sm">{emptySubtext}</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Segment 1: SSR initial batch via VirtualizedAdGrid ─────────────
          VirtualizedAdGrid uses @tanstack/react-virtual for efficient rendering
          of the first page. Transitions + fade-in stagger are handled internally.
      ──────────────────────────────────────────────────────────────────────── */}
      <VirtualizedAdGrid
        ads={initialCards}
        emptyMessage={emptyMessage}
        emptySubtext={emptySubtext}
      />

      {/* ── In-feed ad slot — shown once the SSR batch has rendered ─────── */}
      {initialCards.length >= 6 && (
        <AdUnit format="auto" minHeight={280} className="mt-6" />
      )}

      {/* ── Segment 2: Dynamically appended pages ─────────────────────────
          Each fetched batch is an independent FadeInBatch — this avoids
          triggering a re-render of the entire VirtualizedAdGrid on each fetch.
      ──────────────────────────────────────────────────────────────────────── */}
      {batches.map((batch, batchIdx) => (
        <FadeInBatch
          key={`batch-${batchIdx}`}
          ads={batch}
          startIndex={initialCards.length + batchIdx * pageSize}
        />
      ))}

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {isFetchingState && <BatchSkeleton count={pageSize} />}

      {/* ── Error retry ──────────────────────────────────────────────────── */}
      {fetchError && !isFetchingState && (
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-red-500 font-semibold">{fetchError}</p>
          <button
            type="button"
            onClick={fetchNextPage}
            className="px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 active:scale-95 transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── End-of-feed message ───────────────────────────────────────────── */}
      {!hasMore && !isFetchingState && batches.length > 0 && (
        <p className="mt-10 text-center text-xs text-gray-400 font-medium tracking-wide">
          Vous avez vu toutes les annonces disponibles.
        </p>
      )}

      {/* ── Sentinel: invisible div that triggers the observer ─────────────
          Positioned AFTER all content. The 200px rootMargin means fetch starts
          when the user is still 200px above this element — seamless UX.
      ──────────────────────────────────────────────────────────────────────── */}
      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="h-px w-full"
        />
      )}

      {/* ── Spinner fallback if observer fires but fetch hasn't started ───── */}
      {isFetchingState && (
        <div className="flex justify-center mt-6 mb-2" aria-hidden="true">
          <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
        </div>
      )}
    </div>
  );
}

