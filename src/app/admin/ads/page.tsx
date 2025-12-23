"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AdsTable } from "@/components/ads/AdsTable";
import type { AdminAd, AdsTableFilters } from "@/components/ads/AdsTable";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AdsTableFilters>({
    status: "pending",
    city: "all",
    category: "all",
    query: "",
  });

  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adToReject, setAdToReject] = useState<AdminAd | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAds() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: adsError } = await supabase
          .from("ads")
          .select(
            "id, title, city, status, price, currency, created_at, category, is_featured",
          )
          .order("created_at", { ascending: false })
          .returns<AdminAd[]>();

        if (adsError) {
          throw adsError;
        }

        if (!cancelled) {
          setAds(data ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load ads.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAds();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAds = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return ads.filter((ad) => {
      const normalizedStatus = (ad.status ?? "").toString().toLowerCase();

      if (filters.status && filters.status !== "all") {
        if (normalizedStatus !== filters.status.toLowerCase()) {
          return false;
        }
      }

      if (filters.city && filters.city !== "all") {
        if ((ad.city ?? "") !== filters.city) {
          return false;
        }
      }

      if (filters.category && filters.category !== "all") {
        if ((ad.category ?? "") !== filters.category) {
          return false;
        }
      }

      if (query) {
        const haystack = `${ad.title} ${ad.id}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [ads, filters]);

  function handleFiltersChange(next: AdsTableFilters) {
    setFilters(next);
  }

  async function handleApprove(ad: AdminAd) {
    setModeratingId(ad.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("ads")
        .update({ status: "active", rejection_reason: null })
        .eq("id", ad.id);

      if (updateError) {
        throw updateError;
      }

      setAds((prev) =>
        prev.map((item) =>
          item.id === ad.id ? { ...item, status: "active" } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to approve ad.");
    } finally {
      setModeratingId(null);
    }
  }

  function handleRequestReject(ad: AdminAd) {
    setAdToReject(ad);
    setRejectReason("");
    setRejectError(null);
    setRejectDialogOpen(true);
  }

  async function handleConfirmReject() {
    if (!adToReject) return;

    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("Rejection reason is required.");
      return;
    }

    setRejectSubmitting(true);
    setModeratingId(adToReject.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("ads")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", adToReject.id);

      if (updateError) {
        throw updateError;
      }

      setAds((prev) =>
        prev.map((item) =>
          item.id === adToReject.id ? { ...item, status: "rejected" } : item,
        ),
      );

      setRejectDialogOpen(false);
      setAdToReject(null);
      setRejectReason("");
      setRejectError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to reject ad.");
    } finally {
      setRejectSubmitting(false);
      setModeratingId(null);
    }
  }

  async function handleDelete(ad: AdminAd) {
    setModeratingId(ad.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("ads")
        .update({ status: "deleted" })
        .eq("id", ad.id);

      if (updateError) {
        throw updateError;
      }

      setAds((prev) => prev.filter((item) => item.id !== ad.id));
    } catch (err: any) {
      setError(err.message ?? "Failed to delete ad.");
    } finally {
      setModeratingId(null);
    }
  }

  async function handleToggleFeatured(ad: AdminAd) {
    const nextValue = !ad.is_featured;
    setModeratingId(ad.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("ads")
        .update({ is_featured: nextValue })
        .eq("id", ad.id);

      if (updateError) {
        throw updateError;
      }

      setAds((prev) =>
        prev.map((item) =>
          item.id === ad.id ? { ...item, is_featured: nextValue } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to update featured flag.");
    } finally {
      setModeratingId(null);
    }
  }

  function handleEdit(ad: AdminAd) {
    router.push(`/ads/${ad.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Ads moderation
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          Review, approve, reject, and feature ads across the marketplace.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100 md:text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-zinc-900/60" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-900/60" />
        </div>
      ) : (
        <AdsTable
          ads={filteredAds}
          allAds={ads}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApprove={handleApprove}
          onReject={handleRequestReject}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
          isModeratingId={moderatingId}
        />
      )}

      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!open && !rejectSubmitting) {
            setRejectDialogOpen(false);
            setAdToReject(null);
            setRejectReason("");
            setRejectError(null);
          }
        }}
      >
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-50">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Reject ad
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Provide a clear reason that will be stored with this ad and can be
              surfaced to the seller.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            <p className="text-xs text-zinc-400">
              Ad: {" "}
              <span className="font-medium text-zinc-50">
                {adToReject?.title ?? ""}
              </span>
            </p>

            <div className="space-y-1.5">
              <Label
                htmlFor="rejection-reason"
                className="text-xs text-zinc-300"
              >
                Rejection reason
              </Label>
              <Input
                id="rejection-reason"
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  if (rejectError) {
                    setRejectError(null);
                  }
                }}
                placeholder="Example: This ad violates our content guidelines because..."
                className="h-9 bg-zinc-900 text-xs text-zinc-50 placeholder:text-zinc-500"
              />
              {rejectError ? (
                <p className="text-[11px] text-red-400">{rejectError}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <DialogClose
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-3 text-xs font-medium text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
              disabled={rejectSubmitting}
            >
              Cancel
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              className="h-8 px-3 text-xs"
              onClick={handleConfirmReject}
              disabled={rejectSubmitting}
            >
              {rejectSubmitting ? "Rejecting..." : "Reject ad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
