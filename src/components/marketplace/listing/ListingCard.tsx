"use client";

import type { ListingCardProps } from "@/types/components/marketplace";
import Image from "next/image";
import Link from "next/link";
import { Heart, User, MapPin } from "lucide-react";

function formatDistance(distanceKm?: number): string | null {
  if (distanceKm === undefined || distanceKm === null || isNaN(distanceKm)) return null;
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} متر`;
  }
  return `${distanceKm.toFixed(1)} كلم`;
}

export function ListingCard(props: ListingCardProps) {
  const {
    id,
    title,
    subtitle,
    price,
    imageUrl,
    sellerName,
    sellerAvatar,
    badgeLabel,
    href,
    distanceKm,
  } = props;

  const distanceLabel = formatDistance(distanceKm);
  const normalizedSellerName = typeof sellerName === "string" ? sellerName.trim() : "";
  const displaySellerName = normalizedSellerName || "Utilisateur";

  return (
    <article className="group cursor-pointer flex flex-col bg-white dark:bg-zinc-900 rounded-3xl p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] select-none border border-zinc-100 dark:border-zinc-800">
      <Link href={href} className="flex flex-col gap-2">
        {/* Seller Info */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
            {sellerAvatar ? (
              <Image 
                src={sellerAvatar} 
                alt={displaySellerName} 
                width={32} 
                height={32} 
                className="object-cover"
              />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
            )}
          </div>
          <span className="text-[11px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{displaySellerName}</span>
        </div>

        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-800">
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
              <span className="text-[10px]">Aucune image</span>
            </div>
          )}

          {/* Heart Overlay */}
          <button
            className="absolute right-2 top-2 z-10 p-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full shadow-sm text-zinc-800 dark:text-zinc-200 hover:text-orange-600 transition-colors border border-zinc-100 dark:border-zinc-800"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Heart className="h-4 w-4" />
          </button>

          {badgeLabel && (
            <div className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white shadow-lg">
              {badgeLabel === "Featured" ? "À la une" : badgeLabel}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-1.5 sm:gap-2 px-1 pb-1">
          <h3 className="text-[12px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 h-8 sm:h-10">
            {title}
          </h3>

          <div className="flex flex-col gap-0">
            <span className="text-lg sm:text-xl font-black text-orange-600 tracking-tight leading-none">
              {price}
            </span>
            <div className="flex items-center flex-wrap gap-x-1 sm:gap-x-1.5 gap-y-1 text-zinc-500 text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 border-t border-zinc-50 dark:border-zinc-800 pt-1.5 sm:pt-2">
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500/60" />
                <span className="truncate max-w-[50px] sm:max-w-[60px]">{subtitle || "Maroc"}</span>
              </div>
              {distanceLabel && (
                <>
                  <span className="shrink-0 text-zinc-300">•</span>
                  <span className="shrink-0 text-orange-600/70 font-bold">{distanceLabel}</span>
                </>
              )}
              <span className="shrink-0 text-zinc-300">•</span>
              <span className="shrink-0">Aujourd'hui</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
