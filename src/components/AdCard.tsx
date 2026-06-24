"use client";

import { useState, type ReactNode } from "react";
// Using a standard img for this card to avoid any layout quirks with next/image fill
import Link from "next/link";
import { Clock3, MapPin, Sparkles } from "lucide-react";
import { FavoriteButton } from "./ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";

// Helper to ensure full URL for images
const ensureFullUrl = (url: string | null) => {
  if (!url) return '/placeholder-ad.jpg';
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `${baseUrl}/${cleanPath}`;
};

export type PublicAdCardAd = {
  id: string;
  slug?: string;
  title: string;
  price: string;
  location: string;
  distance?: string;
  createdAt?: string;
  sellerBadge?: string;
  isFeatured?: boolean;
  imageUrl?: string;
  sellerName?: string;
  currency?: string;
  status?: string;
};

export interface AdCardProps {
  ad: PublicAdCardAd;
  variant?: "default" | "featured";
  footerSlot?: ReactNode;
  href?: string;
  canBoost?: boolean;
  onDelete?: (ad: PublicAdCardAd) => void;
  priority?: boolean;
}

export function AdCard({ ad, variant = "default", footerSlot, href, priority = false }: AdCardProps) {
  const isFeatured = variant === "featured" || ad.isFeatured;
  const [imgFailed, setImgFailed] = useState(false);
  
  // SEO: Generate slug if not provided, then construct the new URL structure /ads/[id]/[slug]
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = href || `/ads/${ad.id}/${adSlug}`;

  return (
    <article className="jootiya-card group relative flex h-full flex-col overflow-hidden p-1.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 rounded-[1.25rem] sm:rounded-[1.5rem]">
        {linkHref && (
          <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
            <span className="sr-only">Voir l&apos;annonce</span>
          </Link>
        )}
        
        {ad.imageUrl && !imgFailed ? (
          (() => {
            const src = getOptimizedImageUrl(ad.imageUrl, { width: 800, height: 600, quality: 80, format: 'webp' });
            return (
              <img
                src={src}
                alt={ad.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading={priority ? "eager" : "lazy"}
                onError={() => { setImgFailed(true); }}
                decoding="async"
              />
            );
          })()
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400 dark:from-zinc-800 dark:to-zinc-900">
            <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
          </div>
        )}

        {/* Favorite Heart Icon Overlay */}
        <div className="absolute right-3 top-3 z-30">
          <FavoriteButton 
            adId={ad.id} 
            className="bg-white/90 shadow-sm hover:bg-white text-zinc-700 backdrop-blur-md hover:text-red-500" 
          />
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          {isFeatured && (
            <div className="inline-flex items-center gap-1 rounded-full border border-orange-100 bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur-sm dark:border-orange-900/40 dark:bg-zinc-900/95">
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span className="text-[9px] sm:text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-tight">
                À la une
              </span>
            </div>
          )}
        </div>

        {/* Sold Overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="rotate-[-12deg] rounded-xl border-4 border-white px-4 py-2 text-2xl font-black tracking-tighter text-white shadow-2xl outline outline-2 outline-white/50">
              VENDU
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-grow flex-col px-2.5 pb-3 pt-3 sm:px-3.5 sm:pb-3.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-extrabold leading-snug text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100 sm:text-sm">
          {ad.title}
        </h3>
        
        <div className="mt-2.5 flex flex-col gap-2">
          <p className="truncate text-base font-black tracking-tight text-orange-600 dark:text-orange-500 sm:text-lg">
            {ad.price}
          </p>
          <div className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">{ad.location}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">{ad.createdAt || "Aujourd'hui"}</span>
            </span>
          </div>
        </div>

        {/* Footer Slot: Stays at the bottom */}
        {footerSlot && (
          <div className="mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800/50 relative z-20">
            {footerSlot}
          </div>
        )}
      </div>
    </article>
  );
}
