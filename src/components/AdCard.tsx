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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* Image Section - aspect-square with rounded-t-2xl */}
      <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 rounded-t-2xl">
        {linkHref && (
          <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
            <span className="sr-only">Voir l&apos;annonce</span>
          </Link>
        )}
        
        {ad.imageUrl && !imgFailed ? (
          (() => {
            const src = getOptimizedImageUrl(ad.imageUrl, { width: 500, quality: 75, format: 'webp' });
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

        {/* Favorite Heart Icon Overlay with backdrop-blur-md */}
        <div className="absolute right-2 top-2 z-20">
          <FavoriteButton 
            adId={ad.id} 
            className="h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/50 dark:border-zinc-700/60 shadow-xs flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 transition-transform active:scale-90 hover:scale-105" 
          />
        </div>

        {/* Badges Overlay */}
        {isFeatured && (
          <div className="absolute top-2 left-2 z-20 pointer-events-none">
            <div className="inline-flex items-center gap-1 rounded-lg bg-orange-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
              <Sparkles className="h-2.5 w-2.5" />
              <span>À la une</span>
            </div>
          </div>
        )}

        {/* Sold Overlay */}
        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="rotate-[-12deg] rounded-xl border-2 border-white px-4 py-1 text-sm font-black tracking-tight text-white shadow-lg">
              VENDU
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-1.5">
        <div className="flex flex-col gap-1">
          <Link href={linkHref} className="block group/link">
            <h3 className="line-clamp-1 text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors">
              {ad.title}
            </h3>
          </Link>
          
          <div className="mt-0.5">
            <span className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white tracking-tight">
              {ad.price}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-normal pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60 mt-auto">
          <span className="inline-flex min-w-0 max-w-[62%] items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span className="truncate">{ad.location}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock3 className="h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span>{ad.createdAt || "Aujourd'hui"}</span>
          </span>
        </div>

        {/* Footer Slot: Stays at the bottom */}
        {footerSlot && (
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 relative z-20">
            {footerSlot}
          </div>
        )}
      </div>
    </article>
  );
}
