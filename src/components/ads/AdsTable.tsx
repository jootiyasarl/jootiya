import type React from "react";
import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Check, X, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminAdStatus = string | null;

export interface AdminAd {
  id: string;
  title: string;
  city: string | null;
  category: string | null;
  status: AdminAdStatus;
  price: number | null;
  currency: string | null;
  is_featured: boolean | null;
  created_at: string | null;
}

export interface AdsTableFilters {
  status: string;
  city: string;
  category: string;
  query: string;
}

export interface AdsTableProps {
  ads: AdminAd[];
  allAds: AdminAd[];
  filters: AdsTableFilters;
  onFiltersChange: (next: AdsTableFilters) => void;
  onApprove: (ad: AdminAd) => void;
  onReject: (ad: AdminAd) => void;
  onEdit: (ad: AdminAd) => void;
  onDelete: (ad: AdminAd) => void;
  onToggleFeatured: (ad: AdminAd) => void;
  isModeratingId?: string | null;
}

function getStatusMeta(status: AdminAdStatus): {
  label: string;
  tone: "neutral" | "info" | "success" | "danger";
} {
  const normalized = (status ?? "").toString().toLowerCase();

  if (!normalized || normalized === "pending") {
    return { label: "Pending review", tone: "info" };
  }

  if (normalized === "active" || normalized === "published") {
    return { label: "Active", tone: "success" };
  }

  if (normalized === "rejected") {
    return { label: "Rejected", tone: "danger" };
  }

  if (normalized === "deleted") {
    return { label: "Deleted", tone: "neutral" };
  }

  return { label: status?.toString() || "Unknown", tone: "neutral" };
}

function getStatusBadgeClasses(tone: "neutral" | "info" | "success" | "danger") {
  if (tone === "info") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (tone === "danger") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function formatPrice(price: number | null, currency: string | null): string {
  if (price == null) return "—";
  const trimmedCurrency = (currency ?? "").trim();
  if (!trimmedCurrency) return String(price);
  return `${price} ${trimmedCurrency}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function getUniqueValues(items: AdminAd[], key: keyof Pick<AdminAd, "status" | "city" | "category">): string[] {
  const set = new Set<string>();

  for (const ad of items) {
    const raw = ad[key];
    if (!raw) continue;
    set.add(raw.toString());
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function AdsTable({
  ads,
  allAds,
  filters,
  onFiltersChange,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onToggleFeatured,
  isModeratingId,
}: AdsTableProps) {
  const optionSource = allAds.length ? allAds : ads;

  const statusOptions = getUniqueValues(optionSource, "status");
  const cityOptions = getUniqueValues(optionSource, "city");
  const categoryOptions = getUniqueValues(optionSource, "category");

  const currentStatusLabel =
    filters.status === "all"
      ? "All statuses"
      : getStatusMeta(filters.status).label;

  const currentCityLabel =
    filters.city === "all" ? "All cities" : filters.city || "All cities";

  const currentCategoryLabel =
    filters.category === "all"
      ? "All categories"
      : filters.category || "All categories";

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleCityChange = (value: string) => {
    onFiltersChange({ ...filters, city: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value });
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, query: event.target.value });
  };

  const hasResults = ads.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-zinc-400">Search</Label>
          <Input
            placeholder="Search by title or ID"
            value={filters.query}
            onChange={handleQueryChange}
            className="h-9 bg-zinc-900/40 text-sm text-zinc-50 placeholder:text-zinc-500"
          />
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Status</Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100">
                <span className="truncate text-left text-xs">
                  {currentStatusLabel}
                </span>
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-xs text-zinc-50">
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {getStatusMeta(value).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">City</Label>
            <Select value={filters.city} onValueChange={handleCityChange}>
              <SelectTrigger className="h-9 border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100">
                <span className="truncate text-left text-xs">
                  {currentCityLabel}
                </span>
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-xs text-zinc-50">
                <SelectItem value="all">All cities</SelectItem>
                {cityOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Category</Label>
            <Select
              value={filters.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="h-9 border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100">
                <span className="truncate text-left text-xs">
                  {currentCategoryLabel}
                </span>
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-xs text-zinc-50">
                <SelectItem value="all">All categories</SelectItem>
                {categoryOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-zinc-800/80 bg-zinc-950/80">
              <TableHead className="w-[32%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Ad
              </TableHead>
              <TableHead className="w-[12%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Status
              </TableHead>
              <TableHead className="w-[12%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                City / Category
              </TableHead>
              <TableHead className="w-[12%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Price
              </TableHead>
              <TableHead className="w-[12%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Featured
              </TableHead>
              <TableHead className="w-[20%] text-right text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!hasResults ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  No ads match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => {
                const { label, tone } = getStatusMeta(ad.status);
                const badgeClasses = getStatusBadgeClasses(tone);
                const normalizedStatus =
                  (ad.status ?? "").toString().toLowerCase();
                const isPending = normalizedStatus === "pending";
                const isActive = normalizedStatus === "active";
                const isRejected = normalizedStatus === "rejected";
                const isDeleted = normalizedStatus === "deleted";
                const isFeatured = Boolean(ad.is_featured);
                const isBusy = isModeratingId === ad.id;

                return (
                  <TableRow key={ad.id} className="border-zinc-800/60">
                    <TableCell className="align-top text-sm text-zinc-50">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-2 text-sm font-medium">
                            {ad.title}
                          </span>
                          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            {ad.id.slice(0, 6)}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500">
                          Created {formatDate(ad.created_at)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-sm">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          badgeClasses,
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            tone === "success" && "bg-emerald-500",
                            tone === "info" && "bg-amber-500",
                            tone === "danger" && "bg-red-500",
                            tone === "neutral" && "bg-zinc-400",
                          )}
                        />
                        {label}
                      </Badge>
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-300">
                      <div className="flex flex-col gap-1">
                        <span>{ad.city ?? "—"}</span>
                        <span className="text-[11px] text-zinc-500">
                          {ad.category ?? "No category"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-sm text-zinc-50">
                      {formatPrice(ad.price, ad.currency)}
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-300">
                      <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                        <Star
                          className={cn(
                            "h-3.5 w-3.5",
                            isFeatured
                              ? "text-amber-400 fill-amber-400"
                              : "text-zinc-500",
                          )}
                        />
                        <span className="text-[11px] font-medium">
                          {isFeatured ? "Featured" : "Standard"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || isActive || isDeleted}
                          className="h-8 border-emerald-500/40 bg-emerald-500/10 px-2 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
                          onClick={() => onApprove(ad)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Approve
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || isRejected || isDeleted}
                          className="h-8 border-red-500/40 bg-red-500/10 px-2 text-[11px] text-red-200 hover:bg-red-500/20"
                          onClick={() => onReject(ad)}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Reject
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          className="h-8 border-zinc-700 bg-zinc-900 px-2 text-[11px] text-zinc-100 hover:bg-zinc-800"
                          onClick={() => onEdit(ad)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || isDeleted}
                          className="h-8 border-zinc-800 bg-zinc-950 px-2 text-[11px] text-zinc-300 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-100"
                          onClick={() => onDelete(ad)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || isDeleted}
                          className={cn(
                            "h-8 border-amber-500/40 px-2 text-[11px]",
                            isFeatured
                              ? "bg-amber-500/20 text-amber-100 hover:bg-amber-500/30"
                              : "bg-zinc-950 text-amber-200 hover:bg-amber-500/10",
                          )}
                          onClick={() => onToggleFeatured(ad)}
                        >
                          <Star
                            className={cn(
                              "mr-1 h-3 w-3",
                              isFeatured
                                ? "text-amber-300 fill-amber-300"
                                : "text-amber-300",
                            )}
                          />
                          {isFeatured ? "Unfeature" : "Feature"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
