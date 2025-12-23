"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdStatus = "pending" | "active" | "rejected" | string;

interface ModerationAd {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | string | null;
  currency: string | null;
  city: string | null;
  neighborhood: string | null;
  image_urls: string[] | null;
  created_at: string | null;
  status: AdStatus;
  rejection_reason?: string | null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function formatPrice(price: ModerationAd["price"], currency: string | null): string {
  if (price == null || price === "") return "—";
  const priceValue = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(priceValue)) return String(price);
  const trimmedCurrency = (currency ?? "").trim();
  if (!trimmedCurrency) return String(priceValue);
  return `${priceValue} ${trimmedCurrency}`;
}

function getLocationLabel(ad: ModerationAd): string {
  if (ad.neighborhood && ad.city) {
    return `${ad.neighborhood}, ${ad.city}`;
  }
  if (ad.city) return ad.city;
  return "Unknown location";
}

export default function ModeratorAdsPage() {
  const [ads, setAds] = useState<ModerationAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPendingAds() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: selectError } = await supabase
          .from("ads")
          .select(
            "id, seller_id, title, description, price, currency, city, neighborhood, image_urls, created_at, status, rejection_reason",
          )
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .returns<ModerationAd[]>();

        if (selectError) {
          throw selectError;
        }

        if (!cancelled) {
          const rows = data ?? [];
          setAds(rows);
          if (!selectedId && rows.length > 0) {
            setSelectedId(rows[0].id);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load pending ads.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPendingAds();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedIndex = useMemo(() => {
    if (!selectedId) return -1;
    return ads.findIndex((ad) => ad.id === selectedId);
  }, [ads, selectedId]);

  const selectedAd = selectedIndex >= 0 ? ads[selectedIndex] : null;

  function selectByIndex(index: number) {
    if (index < 0 || index >= ads.length) return;
    setSelectedId(ads[index].id);
  }

  async function handleApprove(ad: ModerationAd) {
    setMutatingId(ad.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("ads")
        .update({ status: "active", rejection_reason: null })
        .eq("id", ad.id);

      if (updateError) {
        throw updateError;
      }

      setAds((prev) => prev.filter((item) => item.id !== ad.id));

      const idx = ads.findIndex((item) => item.id === ad.id);
      if (idx >= 0) {
        const next = ads[idx + 1] ?? ads[idx - 1];
        setSelectedId(next ? next.id : null);
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to approve ad.");
    } finally {
      setMutatingId(null);
    }
  }

  function openRejectDialog(ad: ModerationAd) {
    setSelectedId(ad.id);
    setRejectReason("");
    setRejectError(null);
    setRejectDialogOpen(true);
  }

  async function handleConfirmReject() {
    if (!selectedAd) return;

    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("Rejection reason is required.");
      return;
    }

    setRejectSubmitting(true);
    setMutatingId(selectedAd.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("ads")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", selectedAd.id);

      if (updateError) {
        throw updateError;
      }

      setAds((prev) => prev.filter((item) => item.id !== selectedAd.id));

      const idx = ads.findIndex((item) => item.id === selectedAd.id);
      const next = ads[idx + 1] ?? ads[idx - 1] ?? null;
      setSelectedId(next ? next.id : null);

      setRejectDialogOpen(false);
      setRejectReason("");
      setRejectError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to reject ad.");
    } finally {
      setRejectSubmitting(false);
      setMutatingId(null);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!ads.length) return;

    const target = event.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIdx = selectedIndex >= 0 ? selectedIndex + 1 : 0;
      selectByIndex(nextIdx);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIdx = selectedIndex >= 0 ? selectedIndex - 1 : ads.length - 1;
      selectByIndex(prevIdx);
      return;
    }

    if (event.key === "a" || event.key === "A") {
      if (selectedAd && !mutatingId) {
        event.preventDefault();
        void handleApprove(selectedAd);
      }
      return;
    }

    if (event.key === "r" || event.key === "R") {
      if (selectedAd && !mutatingId) {
        event.preventDefault();
        openRejectDialog(selectedAd);
      }
      return;
    }
  }

  const pendingCount = ads.length;

  return (
    <div
      className="space-y-5"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
            Moderator ad approval
          </h1>
          <p className="text-xs text-zinc-400 md:text-sm">
            Focused view of pending ads only. Use A to approve, R to reject,
            and ↑/↓ to move between ads.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>
            {pendingCount} pending ad{pendingCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100 md:text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-lg bg-zinc-900/60" />
            <div className="h-40 animate-pulse rounded-2xl bg-zinc-900/60" />
          </div>
          <div className="h-60 animate-pulse rounded-2xl bg-zinc-900/60" />
        </div>
      ) : !ads.length ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-8 text-center text-sm text-zinc-400">
          No pending ads. You are all caught up.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Queue</span>
              <span>
                Use ↑/↓ to move. A = approve, R = reject.
              </span>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-2">
              {ads.map((ad) => {
                const isSelected = ad.id === selectedId;
                const isBusy = mutatingId === ad.id;

                return (
                  <button
                    key={ad.id}
                    type="button"
                    onClick={() => setSelectedId(ad.id)}
                    className="w-full text-left"
                  >
                    <div
                      className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 ${
                        isSelected
                          ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                          : "border-zinc-800 bg-zinc-950 text-zinc-50 hover:border-zinc-700 hover:bg-zinc-900"
                      } ${isBusy ? "opacity-70" : ""}`}
                    >
                      <div className="flex-1 space-y-1">
                        <p className="line-clamp-2 text-xs font-medium">
                          {ad.title}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {getLocationLabel(ad)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Created {formatDate(ad.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-semibold">
                          {formatPrice(ad.price, ad.currency)}
                        </span>
                        <Badge
                          variant="outline"
                          className="rounded-full border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-100"
                        >
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:p-5">
            {selectedAd ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-zinc-50 md:text-base">
                      {selectedAd.title}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {getLocationLabel(selectedAd)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Created {formatDate(selectedAd.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-50">
                      {formatPrice(selectedAd.price, selectedAd.currency)}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      ID: {selectedAd.id}
                    </p>
                  </div>
                </div>

                {selectedAd.description ? (
                  <div className="mt-3 rounded-xl bg-zinc-900/80 p-3">
                    <p className="text-xs font-medium text-zinc-100">
                      Description
                    </p>
                    <p className="mt-1 whitespace-pre-line text-xs text-zinc-300">
                      {selectedAd.description}
                    </p>
                  </div>
                ) : null}

                {Array.isArray(selectedAd.image_urls) &&
                selectedAd.image_urls.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-zinc-100">
                      Images
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedAd.image_urls.slice(0, 4).map((src) => (
                        <div
                          key={src}
                          className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
                        >
                          <img
                            src={src}
                            alt={selectedAd.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3">
                  <p className="text-[11px] text-zinc-500">
                    Shortcuts: A = approve, R = reject, ↑/↓ = move between ads.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 bg-emerald-500 px-3 text-xs text-emerald-950 hover:bg-emerald-400"
                      disabled={Boolean(mutatingId)}
                      onClick={() => selectedAd && handleApprove(selectedAd)}
                    >
                      Approve (A)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 border-red-500/60 bg-red-500/10 px-3 text-xs text-red-100 hover:bg-red-500/20"
                      disabled={Boolean(mutatingId)}
                      onClick={() => selectedAd && openRejectDialog(selectedAd)}
                    >
                      Reject (R)
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-zinc-400">
                Select an ad from the queue to review.
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!open && !rejectSubmitting) {
            setRejectDialogOpen(false);
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
              Add a short reason that can be shared with the seller and stored
              for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            {selectedAd ? (
              <p className="text-xs text-zinc-400">
                Ad:
                {" "}
                <span className="font-medium text-zinc-50">
                  {selectedAd.title}
                </span>
              </p>
            ) : null}

            <div className="space-y-1.5">
              <Label
                htmlFor="reject-reason"
                className="text-xs text-zinc-300"
              >
                Rejection reason
              </Label>
              <Input
                id="reject-reason"
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  if (rejectError) setRejectError(null);
                }}
                placeholder="Example: The listing violates our content rules because..."
                className="h-9 bg-zinc-900 text-xs text-zinc-50 placeholder:text-zinc-500"
                disabled={rejectSubmitting}
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
