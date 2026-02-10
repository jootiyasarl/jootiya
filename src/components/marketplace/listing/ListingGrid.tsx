"use client";

import type { ListingGridProps } from "@/types/components/marketplace";
import { ListingCard } from "./ListingCard";
import { NoResultsFallback } from "../NoResultsFallback";

export function ListingGrid({ items, isLoading, skeletonCount = 8, searchQuery, category, city }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="h-60 animate-pulse rounded-xl border bg-zinc-100"
          />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <NoResultsFallback searchQuery={searchQuery} category={category} city={city} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ListingCard key={item.id} {...item} />
      ))}
    </div>
  );
}
