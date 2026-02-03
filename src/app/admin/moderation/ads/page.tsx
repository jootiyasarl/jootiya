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
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          صفحة مراجعة الإعلانات غير متاحة حاليًا.
        </div>
      </div>
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
