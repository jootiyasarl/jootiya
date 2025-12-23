import Link from "next/link";
import { Eye, Pencil, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardAd, DashboardAdStatus } from "@/components/ads/AdRow";

interface AdCardProps {
  ad: DashboardAd;
  canBoost?: boolean;
  onEdit?: (ad: DashboardAd) => void;
  onDelete?: (ad: DashboardAd) => void;
  onBoost?: (ad: DashboardAd) => void;
}

function getStatusMeta(status: DashboardAdStatus) {
  const normalized = (status ?? "").toString().toLowerCase();

  if (normalized === "draft") {
    return {
      label: "Draft",
      badgeClass:
        "border-zinc-200 bg-zinc-50 text-zinc-700",
      dotClass: "bg-zinc-400",
    };
  }

  if (normalized === "pending") {
    return {
      label: "Pending review",
      badgeClass:
        "border-amber-200 bg-amber-50 text-amber-800",
      dotClass: "bg-amber-500",
    };
  }

  if (normalized === "active" || normalized === "published") {
    return {
      label: "Published",
      badgeClass:
        "border-emerald-200 bg-emerald-50 text-emerald-800",
      dotClass: "bg-emerald-500",
    };
  }

  if (normalized === "rejected") {
    return {
      label: "Rejected",
      badgeClass:
        "border-red-200 bg-red-50 text-red-700",
      dotClass: "bg-red-500",
    };
  }

  return {
    label: "Unknown",
    badgeClass:
      "border-zinc-200 bg-zinc-50 text-zinc-700",
    dotClass: "bg-zinc-400",
  };
}

function formatPrice(price: number | null, currency: string | null) {
  if (price == null) return "—";
  const trimmedCurrency = (currency ?? "").trim();
  if (!trimmedCurrency) return String(price);
  return `${price} ${trimmedCurrency}`;
}

export function AdCard({ ad, canBoost = false, onEdit, onDelete, onBoost }: AdCardProps) {
  const { label, badgeClass, dotClass } = getStatusMeta(ad.status);
  const priceLabel = formatPrice(ad.price, ad.currency);
  const views = ad.views_count ?? 0;
  const thumbnail = Array.isArray(ad.image_urls) && ad.image_urls.length > 0
    ? ad.image_urls[0]
    : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="relative h-40 w-full bg-zinc-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={ad.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
            No image
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
            {label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link
            href={`/ads/${ad.id}`}
            className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:underline"
          >
            {ad.title}
          </Link>
          <p className="text-sm font-medium text-zinc-900">{priceLabel}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {ad.city ? <span>{ad.city}</span> : null}
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
              <Eye className="h-3 w-3 text-zinc-400" />
              {views} views
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => onEdit?.(ad)}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete?.(ad)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
          {canBoost ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs text-amber-700 hover:bg-amber-50"
              onClick={() => onBoost?.(ad)}
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Boost
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
