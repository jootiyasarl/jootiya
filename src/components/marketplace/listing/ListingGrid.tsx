"use client";

import type { ListingGridProps } from "@/types/components/marketplace";
import { ListingCard } from "./ListingCard";
import { NoResultsFallback } from "../NoResultsFallback";

export function ListingGrid({ items, isLoading, skeletonCount = 8, searchQuery, category, city }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-4 md:px-6 max-w-7xl mx-auto w-full" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <NoResultsFallback searchQuery={searchQuery} category={category} city={city} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-4 md:px-6 max-w-7xl mx-auto w-full" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      {items.map((item) => (
        <ListingCard key={item.id} {...item} />
      ))}
    </div>
  );
}
