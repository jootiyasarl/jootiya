"use client";

import React from "react";
import { HomeAdCard, ProductCardSkeleton } from "@/components/home/HomeAdCard";
import type { PublicAdCardAd } from "@/components/AdCard";
import { Package } from "lucide-react";

export interface ProductGridProps {
  ads: PublicAdCardAd[];
  loading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  emptySubtext?: string;
  className?: string;
}

/**
 * Production-ready Flat Minimalist Product Grid (Avito Style)
 * - Mobile-first: 2 columns on mobile screens
 * - Responsive: 3 columns on tablet (sm), 4 on desktop (md/lg), 5 on wide/TV (xl/2xl)
 * - Zero emojis, Lucide vector icons only
 * - Complete skeleton loading states with animate-pulse to prevent CLS
 */
export function ProductGrid({
  ads,
  loading = false,
  skeletonCount = 10,
  emptyMessage = "Aucune annonce disponible",
  emptySubtext = "Revenez bientôt ou essayez de modifier vos filtres.",
  className = "",
}: ProductGridProps) {
  // Skeleton Loading State (prevents Cumulative Layout Shift - CLS)
  if (loading) {
    return (
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 ${className}`}
      >
        {[...Array(skeletonCount)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty State
  if (!ads || ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xs border border-zinc-100 dark:border-zinc-700 mb-3">
          <Package className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {emptyMessage}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
          {emptySubtext}
        </p>
      </div>
    );
  }

  // Active Product Grid
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 ${className}`}
    >
      {ads.map((ad, index) => (
        <div key={ad.id} className="h-full">
          <HomeAdCard ad={ad} priority={index < 4} />
        </div>
      ))}
    </div>
  );
}

export { HomeAdCard, ProductCardSkeleton };
export type { PublicAdCardAd };
