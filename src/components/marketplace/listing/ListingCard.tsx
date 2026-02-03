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
    <article className="group cursor-pointer flex flex-col gap-3 bg-white hover:bg-zinc-50/50 transition-colors duration-200">
      <Link href={href} className="flex flex-col gap-3">
        {/* Seller Info */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-xs font-bold text-zinc-900 truncate">{sellerName || "Vendeur Jootiya"}</span>
        </div>

        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
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
            className="absolute right-3 top-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-zinc-800 hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Heart className="h-5 w-5" />
          </button>

          {badgeLabel && (
            <div className="absolute left-3 top-3 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {badgeLabel === "Featured" ? "À la une" : badgeLabel}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-1 px-1 pb-2">
          <h3 className="text-[15px] font-medium text-zinc-900 leading-tight line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>

          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[17px] font-black text-zinc-900">
              {price}
            </span>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1">
              <span className="truncate">{subtitle || "Maroc"}</span>
              <span className="shrink-0">•</span>
              <span className="shrink-0">Aujourd'hui</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
