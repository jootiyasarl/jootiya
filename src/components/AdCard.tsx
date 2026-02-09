"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, User } from "lucide-react";

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

  const card = (
    <article className="group cursor-pointer flex flex-col gap-3 bg-white rounded-[1.5rem] p-1 border border-zinc-50 hover:border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Seller Header */}
      <div className="flex items-center gap-2 px-2 pt-1">
        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
          <User className="w-4 h-4 text-zinc-400" />
        </div>
        <span className="text-[11px] font-bold text-zinc-500 truncate">{ad.sellerName || "Vendeur Jootiya"}</span>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-zinc-50">
        {ad.imageUrl ? (
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <span className="text-xs">Aucune image</span>
          </div>
        )}

        {/* Favorite Heart Icon Overlay */}
        <button
          className="absolute right-3 top-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-zinc-800 hover:text-orange-600 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // Wishlist logic
          }}
        >
          <Heart className="h-5 w-5" />
        </button>

        {isFeatured && (
          <div className="absolute left-3 top-3 rounded-lg bg-orange-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            À la une
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1 px-3 pb-4">
        <h3 className="text-[14px] font-semibold text-zinc-800 leading-snug line-clamp-2 min-h-[2.5rem]">
          {ad.title}
        </h3>

        <div className="flex flex-col gap-0.5 mt-2">
          <span className="text-base font-black text-orange-600">
            {ad.price}
          </span>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mt-1 font-medium">
            <span className="truncate">{ad.location}</span>
            <span className="shrink-0">•</span>
            <span className="shrink-0">{ad.createdAt || "Aujourd'hui"}</span>
          </div>
        </div>

        {footerSlot}
      </div>
    </article>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
