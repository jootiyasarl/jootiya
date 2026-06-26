"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, Sparkles } from "lucide-react";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { generateSlug } from "@/lib/seo-utils";
import { getOptimizedImageUrl } from "@/lib/storageUtils";
import type { PublicAdCardAd } from "@/components/AdCard";

export function HomeAdCard({ ad, priority = false }: { ad: PublicAdCardAd; priority?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const adSlug = ad.slug || generateSlug(ad.title);
  const linkHref = `/ads/${ad.id}/${adSlug}`;

  return (
    <article className="card card-border bg-white dark:bg-zinc-900 group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]">
      <figure className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden m-0">
        <Link href={linkHref} className="absolute inset-0 z-10" aria-label={ad.title}>
          <span className="sr-only">Voir l&apos;annonce</span>
        </Link>

        {ad.imageUrl && !imgFailed ? (
          <img
            src={getOptimizedImageUrl(ad.imageUrl, { width: 800, height: 600, quality: 80, format: "webp" })}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImgFailed(true)}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
          </div>
        )}

        <div className="absolute right-3 top-3 z-30">
          <FavoriteButton
            adId={ad.id}
            className="btn btn-circle btn-xs bg-white/90 hover:bg-white text-zinc-700 hover:text-red-500 backdrop-blur-md shadow-sm border-0"
          />
        </div>

        {ad.isFeatured && (
          <div className="absolute top-3 left-3 z-20">
            <span className="badge badge-primary badge-soft gap-1 shadow-sm">
              <Sparkles className="h-3 w-3" />
              À la une
            </span>
          </div>
        )}

        {ad.status === "sold" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="rotate-[-12deg] rounded-xl border-4 border-white px-4 py-2 text-2xl font-black tracking-tighter text-white shadow-2xl outline outline-2 outline-white/50">
              VENDU
            </div>
          </div>
        )}
      </figure>

      <div className="card-body p-4 flex flex-col gap-3">
        <Link href={linkHref} className="block group/link">
          <h3 className="card-title line-clamp-2 text-sm font-extrabold leading-snug text-zinc-900 dark:text-zinc-100 group-hover/link:text-orange-600 transition-colors">
            {ad.title}
          </h3>
        </Link>

        <p className="text-lg font-black tracking-tight text-orange-600 dark:text-orange-500">
          {ad.price}
        </p>

        <div className="flex flex-col gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ad.location}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ad.createdAt || "Aujourd'hui"}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
