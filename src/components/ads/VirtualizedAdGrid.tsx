"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { HomeAdCard } from "@/components/home/HomeAdCard";
import type { PublicAdCardAd } from "@/components/AdCard";
import { Package } from "lucide-react";

export interface VirtualizedAdGridProps {
  ads: PublicAdCardAd[];
  emptyMessage?: string;
  emptySubtext?: string;
  className?: string;
  renderCard?: (ad: PublicAdCardAd, index: number) => React.ReactNode;
}

// ── Fade-in card wrapper using Intersection Observer ──────────────────────────
// Each card fades + slides up once it enters the viewport
function FadeInCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // fire once only
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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

  // Responsive column detection (2 mobile → 3 tablet → 4 desktop → 5 wide)
  const updateLayout = useCallback(() => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (width >= 1280) setColumnCount(5);
    else if (width >= 1024) setColumnCount(4);
    else if (width >= 640) setColumnCount(3);
    else setColumnCount(2);

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

  useEffect(() => {
    if (mounted && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setContainerOffset(rect.top + scrollTop);
    }
  }, [ads.length, mounted]);

  // Chunk ads into rows
  const rows = useMemo(() => {
    const chunked: PublicAdCardAd[][] = [];
    for (let i = 0; i < ads.length; i += columnCount) {
      chunked.push(ads.slice(i, i + columnCount));
    }
    return chunked;
  }, [ads, columnCount]);

  // TanStack Window Virtualizer
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (columnCount === 2 ? 220 : 290),
    overscan: 3,
    scrollMargin: containerOffset,
  });

  // ── Empty state ──
  if (!ads.length) {
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

  // ── SSR / pre-mount: first 10 cards (for SEO + hydration safety) ──
  if (!mounted) {
    return (
      <div ref={containerRef} className={className}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          {ads.slice(0, 10).map((ad, idx) => (
            <div key={ad.id}>
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

          const translateY =
            virtualRow.start - (rowVirtualizer.options.scrollMargin ?? 0);

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
                  // Stagger delay: cards in same row appear one after another (0→60→120ms)
                  const staggerDelay = colIdx * 60;

                  return (
                    <FadeInCard key={ad.id} delay={staggerDelay}>
                      {renderCard ? (
                        renderCard(ad, globalIndex)
                      ) : (
                        <HomeAdCard ad={ad} priority={globalIndex < 4} />
                      )}
                    </FadeInCard>
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
