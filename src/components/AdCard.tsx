import type { ReactNode } from "react";
import Link from "next/link";

export type PublicAdCardAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  distance?: string;
  createdAt?: string;
  sellerBadge?: string;
  isFeatured?: boolean;
};

export interface AdCardProps {
  ad: PublicAdCardAd;
  variant?: "default" | "featured";
  footerSlot?: ReactNode;
  href?: string;
}

export function AdCard({ ad, variant = "default", footerSlot, href }: AdCardProps) {
  const isFeatured = variant === "featured" || ad.isFeatured;

  const card = (
    <article
      className={[
        "flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition",
        isFeatured
          ? "border-zinc-900/10 shadow-md"
          : "border-zinc-100 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className="relative">
        <div className="h-40 bg-zinc-100" />
        {isFeatured ? (
          <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-zinc-900/90 px-2 py-0.5 text-[10px] font-medium text-zinc-50">
            Featured
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">
            {ad.title}
          </h3>
          <p className="text-sm font-semibold text-zinc-900">{ad.price}</p>
        </div>
        <div className="mt-auto space-y-1">
          <p className="text-xs text-zinc-600">
            {ad.location}
            {ad.distance ? ` • ${ad.distance}` : null}
          </p>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>{ad.createdAt}</span>
            {ad.sellerBadge ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                {ad.sellerBadge}
              </span>
            ) : null}
          </div>
          {footerSlot}
        </div>
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
