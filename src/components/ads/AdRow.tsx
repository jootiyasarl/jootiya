import Link from "next/link";
import { Eye, Pencil, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type DashboardAdStatus = string;

export interface DashboardAd {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  status: DashboardAdStatus;
  images: string[] | null;
  location: string | null; // This is now a formatted string from city/neighborhood
  created_at: string;
  views_count?: number | null;
}

interface AdRowProps {
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

export function AdRow({ ad, canBoost = false, onEdit, onDelete, onBoost }: AdRowProps) {
  const { label, badgeClass, dotClass } = getStatusMeta(ad.status);
  const priceLabel = formatPrice(ad.price, ad.currency);
  const views = ad.views_count ?? 0;
  const thumbnail = Array.isArray(ad.images) && ad.images.length > 0
    ? ad.images[0]
    : null;

  return (
    <tr className="border-b last:border-b-0">
      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-md border bg-zinc-100">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={ad.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-zinc-400">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href={`/ads/${ad.id}`}
              className="line-clamp-1 text-sm font-medium text-zinc-900 hover:underline"
            >
              {ad.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <Badge
                variant="outline"
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                {label}
              </Badge>
              {ad.location ? <span>{ad.location}</span> : null}
            </div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-900">
        {priceLabel}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-600">
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs">
          <Eye className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-800">{views}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 border-zinc-200"
            onClick={() => onEdit?.(ad)}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit ad</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 border-zinc-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete?.(ad)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete ad</span>
          </Button>
          {canBoost ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => onBoost?.(ad)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="sr-only">Boost ad</span>
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
