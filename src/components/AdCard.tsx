"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, User } from "lucide-react";
import { FavoriteButton } from "./ads/FavoriteButton";

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
}

export function AdCard({ ad, variant = "default", footerSlot, href, onDelete }: AdCardProps) {
  const isFeatured = variant === "featured" || ad.isFeatured;
  const linkHref = href || `/ads/${ad.slug || ad.id}`;

  return (
    <article className="group relative flex flex-col gap-3 bg-white rounded-[1.5rem] p-1 border border-zinc-50 hover:border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Main Clickable Link Overlay */}
      {linkHref && (
        <Link href={linkHref} className="absolute inset-0 z-10 rounded-[1.5rem]" aria-label={ad.title}>
          <span className="sr-only">Voir l'annonce</span>
        </Link>
      )}

      {/* Seller Header */}
      <div className="flex items-center gap-2 px-2 pt-1 relative z-20 pointer-events-none">
        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
          <User className="w-4 h-4 text-zinc-400" />
        </div>
        <span className="text-[11px] font-bold text-zinc-500 truncate max-w-[120px]">{ad.sellerName || "Vendeur Jootiya"}</span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-zinc-50">
        {ad.imageUrl ? (
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <span className="text-xs">Aucune image</span>
          </div>
        )}

        {/* Favorite Heart Icon Overlay */}
        <div className="absolute right-3 top-3 z-30">
          <FavoriteButton adId={ad.id} className="shadow-sm" />
        </div>

        {isFeatured && (
          <div className="absolute left-3 top-3 z-20 rounded-lg bg-orange-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            À la une
          </div>
        )}

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
      <div className="flex flex-col gap-1 px-3 pb-4 pointer-events-none">
        <h3 className="text-[14px] font-semibold text-zinc-800 leading-snug line-clamp-2 min-h-[2.5rem]">
          {ad.title}
        </h3>

        <div className="flex flex-col gap-0.5 mt-2">
          <span className="text-base font-black text-orange-600">
            {ad.price}
          </span>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mt-1 font-medium">
            <span className="truncate max-w-[100px]">{ad.location}</span>
            <span className="shrink-0">•</span>
            <span className="shrink-0">{ad.createdAt || "Aujourd'hui"}</span>
          </div>
        </div>

        {/* Footer Slot - Needs pointer-events-auto if it contains buttons */}
        {footerSlot && (
          <div className="mt-2 pointer-events-auto z-20 relative">
            {footerSlot}
          </div>
        )}
      </div>
    </article>
  );
}
