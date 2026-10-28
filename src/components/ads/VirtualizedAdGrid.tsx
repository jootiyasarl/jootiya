"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { HomeAdCard } from "@/components/home/HomeAdCard";
import type { PublicAdCardAd } from "@/components/AdCard";
import { Package, Sparkles } from "lucide-react";

export interface VirtualizedAdGridProps {
  ads: PublicAdCardAd[];
  emptyMessage?: string;
  emptySubtext?: string;
  className?: string;
  renderCard?: (ad: PublicAdCardAd, index: number) => React.ReactNode;
}

export function VirtualizedAdGrid({
  ads,
  emptyMessage = "Aucune annonce trouvée",
  emptySubtext = "Essayez d'ajuster vos filtres ou revenez plus tard.",
  className = "",
  renderCard,
}: VirtualizedAdGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [columnCount, setColumnCount] = useState(2);
  const [containerOffset, setContainerOffset] = useState(0);

  // Responsive column detection (2 on mobile, 3 on tablet, 4 on desktop, 5 on wide screens/TV)
  const updateLayout = useCallback(() => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (width >= 1280) {
      setColumnCount(5);
    } else if (width >= 1024) {
      setColumnCount(4);
    } else if (width >= 640) {
      setColumnCount(3);
    } else {
      setColumnCount(2);
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setContainerOffset(rect.top + scrollTop);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    updateLayout();

    window.addEventListener("resize", updateLayout, { passive: true });
    return () => window.removeEventListener("resize", updateLayout);
  }, [updateLayout]);

  // Recalculate container offset when ads or layout change
  useEffect(() => {
    if (mounted && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setContainerOffset(rect.top + scrollTop);
    }
  }, [ads.length, mounted]);

  // Chunk ads into virtual rows based on responsive column count
  const rows = useMemo(() => {
    const chunked: PublicAdCardAd[][] = [];
    for (let i = 0; i < ads.length; i += columnCount) {
      chunked.push(ads.slice(i, i + columnCount));
    }
    return chunked;
  }, [ads, columnCount]);

  // TanStack Window Virtualizer — tuned for aspect-[4/3] cards
  // Card height estimate: image(4/3 ratio) + info-block (~90px)
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (columnCount === 2 ? 220 : 290),
    overscan: 3,
    scrollMargin: containerOffset,
  });

  // Empty state
  if (!ads.length) {
    return (
      <div className="card card-border border-dashed bg-zinc-50/60 dark:bg-zinc-900/40 p-8 sm:p-14 text-center rounded-[2rem] border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
            <Package className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{emptyMessage}</h3>
          <p className="text-sm text-zinc-500 font-medium max-w-sm">{emptySubtext}</p>
        </div>
      </div>
    );
  }

  // SSR / Initial Render (first 10 ads) for SEO & Hydration safety
  if (!mounted) {
    return (
      <div ref={containerRef} className={className}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          {ads.slice(0, 10).map((ad, idx) => (
            <div key={ad.id} className="h-full">
              {renderCard ? renderCard(ad, idx) : <HomeAdCard ad={ad} priority={idx < 4} />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Scroll canvas matching total virtualized height */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowAds = rows[virtualRow.index];
          if (!rowAds) return null;

          const translateY = virtualRow.start - (rowVirtualizer.options.scrollMargin ?? 0);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${translateY}px)`,
                paddingBottom: "16px",
              }}
            >
              <div
                className="grid gap-2.5 sm:gap-3 md:gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                }}
              >
                {rowAds.map((ad, colIdx) => {
                  const globalIndex = virtualRow.index * columnCount + colIdx;
                  return (
                    <div key={ad.id} className="h-full">
                      {renderCard ? (
                        renderCard(ad, globalIndex)
                      ) : (
                        <HomeAdCard ad={ad} priority={globalIndex < 4} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
