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
    <article className="jootiya-card group relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 rounded-[1.5rem]">
        {linkHref && (
          <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
            <span className="sr-only">Voir l'annonce</span>
          </Link>
        )}
        
        {ad.imageUrl ? (
          <Image
            src={getOptimizedImageUrl(ensureFullUrl(ad.imageUrl), { width: 400, height: 300, quality: 80, format: 'webp' })}
            alt={ad.title}
            fill
            priority={priority}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading={priority ? "eager" : "lazy"}
            unoptimized={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
          </div>
        )}

        {/* Favorite Heart Icon Overlay */}
        <div className="absolute right-3 top-3 z-30">
          <FavoriteButton 
            adId={ad.id} 
            className="bg-transparent shadow-none hover:bg-transparent text-white drop-shadow-md hover:text-red-500" 
          />
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          {isFeatured && (
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-700/50">
              <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-tight">
                Coup de cœur
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
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 h-10 mb-2 leading-snug">
          {ad.title}
        </h3>
        
        <div className="mt-auto">
          <p className="text-orange-600 dark:text-orange-500 font-extrabold text-lg">
            {ad.price}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {ad.location} • {ad.createdAt || "Aujourd'hui"}
          </p>
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
