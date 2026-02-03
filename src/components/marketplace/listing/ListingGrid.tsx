"use client";

import type { ListingGridProps } from "@/types/components/marketplace";
import { ListingCard } from "./ListingCard";

export function ListingGrid({ items, isLoading, skeletonCount = 8 }: ListingGridProps) {
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
    return (
      <div className="rounded-xl border border-dashed bg-zinc-50 p-8 text-center text-sm text-zinc-500">
        Aucune annonce trouvée.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ListingCard key={item.id} {...item} />
      ))}
    </div>
  );
}
