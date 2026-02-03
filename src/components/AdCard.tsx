import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export type PublicAdCardAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  distance?: string;
  createdAt?: string;
  sellerBadge?: string;
  isFeatured?: boolean;
  imageUrl?: string;
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

  const card = (
    <article className="group cursor-pointer flex flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-200">
        {ad.imageUrl ? (
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Favorite Heart Icon Overlay */}
        <button className="absolute right-3 top-3 z-10 text-white/70 transition-transform active:scale-90 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(0,0,0,0.5)" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 drop-shadow-sm"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
        </button>

        {isFeatured && (
          <div className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-900 shadow-sm backdrop-blur-sm">
            مميز
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-zinc-900 text-[15px] leading-tight truncate w-full pr-2">
            {ad.title}
          </h3>
          <div className="flex items-center gap-1 text-zinc-800 font-medium text-sm whitespace-nowrap">
            <span className="text-zinc-900">★</span> 4.9
          </div>
        </div>

        <p className="text-zinc-500 text-[15px] truncate">
          {ad.location} {ad.distance && `• ${ad.distance}`}
        </p>

        <p className="text-zinc-500 text-[15px] truncate">
          <span className="text-zinc-900 font-semibold">{ad.price}</span>
        </p>

        {ad.createdAt && (
          <p className="text-zinc-400 text-xs mt-1">{ad.createdAt}</p>
        )}

        {footerSlot}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
