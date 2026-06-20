"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPin, Sparkles } from "lucide-react";
import { FavoriteButton } from "./ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";

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
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  
  // SEO: Generate slug if not provided, then construct the new URL structure /ads/[id]/[slug]
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = href || `/ads/${ad.id}/${adSlug}`;

  return (
    <article className="card bg-base-100 group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99] border-0 shadow-none">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 rounded-[1.25rem] sm:rounded-[1.5rem]">
        {linkHref && (
          <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
            <span className="sr-only">Voir l&apos;annonce</span>
          </Link>
        )}
        
        {ad.imageUrl && failedImageUrl !== ad.imageUrl ? (
          <Image
            src={getOptimizedImageUrl(ad.imageUrl, { format: 'origin' })}
            alt={ad.title}
            fill
            priority={priority}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 420px) 72vw, (max-width: 640px) 46vw, (max-width: 1024px) 24vw, 19vw"
            loading={priority ? "eager" : "lazy"}
            onError={() => {
              console.error('AdCard image failed:', ad.imageUrl);
              setFailedImageUrl(ad.imageUrl ?? null);
            }}
          />
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
            <div className="badge badge-primary gap-1">
              <Sparkles className="h-3 w-3" />
              À la une
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
      <div className="card-body flex flex-grow flex-col p-3 sm:p-4 gap-0">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-extrabold leading-snug text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100 sm:text-sm">
          {ad.title}
        </h3>
        
        <div className="mt-2 flex flex-col gap-2">
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
