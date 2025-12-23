"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface HomepageAdCardProps {
  imageUrl?: string | null;
  title: string;
  priceLabel: string;
  distanceLabel?: string;
  neighborhoodLabel?: string;
  isVerified?: boolean;
  href?: string;
  className?: string;
}

export function HomepageAdCard({
  imageUrl,
  title,
  priceLabel,
  distanceLabel,
  neighborhoodLabel,
  isVerified = false,
  href,
  className,
}: HomepageAdCardProps) {
  const content = (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border-zinc-100 bg-white text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="relative h-40 w-full bg-zinc-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
            No image
          </div>
        )}

        {distanceLabel ? (
          <div className="absolute left-2 top-2 inline-flex items-center rounded-full bg-zinc-900/85 px-2 py-0.5 text-[10px] font-medium text-zinc-50">
            {distanceLabel}
          </div>
        ) : null}

        {isVerified ? (
          <div className="absolute right-2 top-2">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1 rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified
            </Badge>
          </div>
        ) : null}
      </div>

      <CardContent>
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
            {title}
          </h3>
          <p className="text-sm font-semibold text-zinc-900">{priceLabel}</p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="truncate">
            {neighborhoodLabel ?? "Nearby"}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
