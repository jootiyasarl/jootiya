"use client";

import type { ListingGridProps } from "@/types/components/marketplace";
import { VirtualizedAdGrid } from "@/components/ads/VirtualizedAdGrid";
import { NoResultsFallback } from "../NoResultsFallback";
import type { PublicAdCardAd } from "@/components/AdCard";

export function ListingGrid({ items, isLoading, skeletonCount = 8, searchQuery, category, city }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 px-4 md:px-6 max-w-7xl mx-auto w-full">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <NoResultsFallback searchQuery={searchQuery} category={category} city={city} />;
  }

  const mappedAds: PublicAdCardAd[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price || "—",
    location: item.subtitle || "Maroc",
    sellerBadge: item.badgeLabel,
    isFeatured: item.badgeLabel === "Featured",
    imageUrl: item.imageUrl,
  }));

  return (
    <div className="px-4 md:px-6 max-w-7xl mx-auto w-full">
      <VirtualizedAdGrid ads={mappedAds} />
    </div>
  );
}
