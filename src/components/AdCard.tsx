"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, User } from "lucide-react";
import { FavoriteButton } from "./ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";

// Helper to ensure full URL for images
const ensureFullUrl = (url: string | null) => {
  if (!url) return '/placeholder-ad.png';
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `${baseUrl}/${cleanPath}`;
};

// Optimized Image Component for Ad Cards
const OptimizedAdImage = ({ src, alt, priority = false }: { src: string, alt: string, priority?: boolean }) => {
  const fullUrl = ensureFullUrl(src);
  return (
    <div className="relative h-full w-full">
      <Image
        src={getOptimizedImageUrl(fullUrl, { width: 400, height: 400, quality: 75 })}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
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
  onDelete?: (ad: any) => void;
  priority?: boolean;
}

export function AdCard({ ad, variant = "default", footerSlot, href, onDelete, priority = false }: AdCardProps) {
  const isFeatured = variant === "featured" || ad.isFeatured;
  
  // SEO: Generate slug if not provided, then construct the new URL structure /ads/[id]/[slug]
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = href || `/ads/${ad.id}/${adSlug}`;

  return (
    <article className="group relative flex flex-col gap-2">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-white dark:bg-zinc-900 transition-all duration-300">
        {linkHref && (
          <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
            <span className="sr-only">Voir l'annonce</span>
          </Link>
        )}
        
        {ad.imageUrl ? (
          <OptimizedAdImage 
            src={ad.imageUrl} 
            alt={ad.title} 
            priority={priority} 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
            <span className="text-xs">Aucune image</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          {isFeatured && (
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-700/50">
              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                Coup de cœur
              </span>
            </div>
          )}
        </div>

        {/* Favorite Heart Icon Overlay */}
        <div className="absolute right-3 top-3 z-30">
          <FavoriteButton 
            adId={ad.id} 
            className="bg-transparent shadow-none hover:bg-transparent text-white drop-shadow-md hover:text-red-500" 
          />
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
      <div className="flex flex-col gap-0 px-0.5 mt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
            {ad.title}
          </h3>
        </div>
        
        <p className="text-[12px] text-zinc-600 dark:text-zinc-300 font-medium truncate">
          {ad.location}
        </p>
        
        <p className="text-[12px] text-zinc-600 dark:text-zinc-300 font-medium">
          {ad.createdAt || "Aujourd'hui"}
        </p>
        
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
            {ad.price}
          </span>
        </div>

        {/* Footer Slot */}
        {footerSlot && (
          <div className="mt-2 relative z-20">
            {footerSlot}
          </div>
        )}
      </div>
    </article>
  );
}
