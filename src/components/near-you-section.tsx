"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBrowserGeolocation } from "@/lib/adLocation";
import { fetchNearbyAds, type NearbyAd } from "@/lib/nearbyAds";

export interface NearYouSectionProps {
  radiusKm?: number;
  maxItems?: number;
}

interface NearbyAdCardProps {
  ad: NearbyAd;
  className?: string;
}

function formatPrice(price: number | null, currency: string | null): string {
  if (price == null) return "—";
  const trimmedCurrency = (currency ?? "").trim();
  if (!trimmedCurrency) return String(price);
  return `${price} ${trimmedCurrency}`;
}

function formatDistance(distanceKm: number): string {
  if (!Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) {
    const meters = Math.round((distanceKm * 1000) / 50) * 50;
    const safeMeters = Math.max(meters, 50);
    return `${safeMeters}m away`;
  }
  const km = Math.round(distanceKm * 10) / 10;
  return `${km} km away`;
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

function NearbyAdCard({ ad, className }: NearbyAdCardProps) {
  const imageUrl =
    Array.isArray(ad.image_urls) && ad.image_urls.length > 0
      ? ad.image_urls[0]
      : null;

  const locationLabel =
    ad.neighborhood && ad.city
      ? `${ad.neighborhood}, ${ad.city}`
      : ad.neighborhood ?? ad.city ?? "Nearby";

  const distanceLabel = formatDistance(ad.distanceKm);
  const timeAgo = formatTimeAgo(ad.created_at ?? null);
  const priceLabel = formatPrice(ad.price, ad.currency);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm",
        className,
      )}
    >
      <Link href={`/ads/${ad.id}`} className="flex flex-1 flex-col">
        <div className="relative h-36 w-full bg-zinc-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
              No image
            </div>
          )}
          {distanceLabel ? (
            <div className="absolute left-2 top-2 inline-flex items-center rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-50">
              {distanceLabel}
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">
              {ad.title}
            </h3>
            <p className="text-sm font-semibold text-zinc-900">{priceLabel}</p>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span className="truncate">{locationLabel}</span>
            {timeAgo ? <span>{timeAgo}</span> : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

function NearbySkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white",
        className,
      )}
    >
      <div className="h-36 w-full animate-pulse bg-zinc-100" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
        <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export function NearYouSection({
  radiusKm = 3,
  maxItems = 12,
}: NearYouSectionProps) {
  const [ads, setAds] = useState<NearbyAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function detectAndLoad() {
      try {
        setLoading(true);
        setError(null);
        setLocating(true);

        const geo = await getBrowserGeolocation();
        if (cancelled) return;

        const nearby = await fetchNearbyAds({
          latitude: geo.latitude,
          longitude: geo.longitude,
          radiusKm,
          limit: maxItems,
        });

        if (!cancelled) {
          setAds(nearby);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message ??
              "We couldn't load nearby ads. Please try again in a moment.",
          );
          setAds([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLocating(false);
        }
      }
    }

    detectAndLoad();

    return () => {
      cancelled = true;
    };
  }, [radiusKm, maxItems, reloadToken]);

  const showEmptyState = !loading && !error && ads.length === 0;

  function handleReload() {
    setReloadToken((prev) => prev + 1);
  }

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-100 bg-white px-5 py-5 sm:px-6">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">
            Near you now
          </h2>
          <p className="text-xs text-zinc-500">
            Fresh ads within about {radiusKm} km of your location.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {locating ? (
            <span className="text-[11px] text-zinc-500">Detecting...</span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReload}
            className="h-7 px-2 text-[11px]"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={handleReload}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {loading ? (
        <>
          <div className="-mx-4 block md:hidden">
            <div className="flex gap-3 overflow-x-auto px-4 pb-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <NearbySkeletonCard key={index} className="w-64 flex-none" />
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <NearbySkeletonCard key={index} />
              ))}
            </div>
          </div>
        </>
      ) : showEmptyState ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center text-sm text-zinc-500">
          No nearby ads yet. Try expanding your search radius or checking back
          later.
        </div>
      ) : (
        <>
          <div className="-mx-4 block md:hidden">
            <div className="flex gap-3 overflow-x-auto px-4 pb-2">
              {ads.map((ad) => (
                <NearbyAdCard
                  key={ad.id}
                  ad={ad}
                  className="w-64 flex-none snap-start"
                />
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <NearbyAdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
