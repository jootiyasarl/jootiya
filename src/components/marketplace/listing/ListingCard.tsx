"use client";

import type { ListingCardProps } from "@/types/components/marketplace";
import Image from "next/image";
import Link from "next/link";
import { Heart, User } from "lucide-react";

export function ListingCard(props: ListingCardProps) {
  const {
    id,
    title,
    subtitle,
    price,
    imageUrl,
    sellerName,
    badgeLabel,
    href,
  } = props;

  return (
    <article className="group cursor-pointer flex flex-col gap-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] p-4 shadow-premium hover:shadow-2xl transition-all duration-300 active:scale-[0.98] select-none border border-zinc-100 dark:border-zinc-800">
      <Link href={href} className="flex flex-col gap-3">
        {/* Seller Info */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-sm font-bold text-zinc-900 truncate">{sellerName || "Vendeur Jootiya"}</span>
        </div>

        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.25rem] bg-zinc-100 shadow-inner-soft">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <span className="text-xs">Aucune image</span>
            </div>
          )}

          {/* Heart Overlay */}
          <button
            className="absolute right-3 top-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-zinc-800 hover:text-orange-600 transition-colors rounded-[1.5rem]"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Heart className="h-5 w-5" />
          </button>

          {badgeLabel && (
            <div className="absolute left-3 top-3 rounded-full bg-orange-600/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-lg">
              {badgeLabel === "Featured" ? "À la une" : badgeLabel}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-2 px-2 pb-3">
          <h3 className="text-base font-medium text-zinc-900 leading-tight line-clamp-2 min-h-[3rem]">
            {title}
          </h3>

          <div className="flex flex-col gap-0.5 mt-2">
            <span className="text-2xl font-black text-orange-600 tracking-tight">
              {price}
            </span>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1">
              <span className="text-sm text-zinc-500 truncate">{subtitle || "Maroc"}</span>
              <span className="shrink-0">•</span>
              <span className="shrink-0">Aujourd'hui</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
