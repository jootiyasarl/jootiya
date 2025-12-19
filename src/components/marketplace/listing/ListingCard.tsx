"use client";

import type { ListingCardProps } from "@/types/components/marketplace";
import Image from "next/image";
import Link from "next/link";

export function ListingCard(props: ListingCardProps) {
  const {
    id,
    title,
    subtitle,
    price,
    rating,
    ratingCount,
    imageUrl,
    sellerName,
    badgeLabel,
    href,
  } = props;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {imageUrl ? (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-400">
          No image
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                {subtitle}
              </p>
            ) : null}
          </div>

          {badgeLabel ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              {badgeLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            {rating !== undefined ? (
              <span className="font-medium text-zinc-900">
                {rating.toFixed(1)}
              </span>
            ) : null}
            {ratingCount !== undefined ? (
              <span className="text-[11px] text-zinc-400">
                ({ratingCount})
              </span>
            ) : null}
          </div>

          {sellerName ? (
            <span className="truncate text-[11px] text-zinc-500">
              by {sellerName}
            </span>
          ) : null}
        </div>

        {price ? (
          <div className="mt-2 text-sm font-semibold text-zinc-900">
            {price}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
