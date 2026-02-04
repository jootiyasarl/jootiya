"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AdRow, type DashboardAd } from "@/components/ads/AdRow";
import { AdCard } from "@/components/ads/AdCard";

interface MyAdsClientProps {
    initialAds: DashboardAd[];
}

export function MyAdsClient({ initialAds }: MyAdsClientProps) {
    const router = useRouter();
    const [ads, setAds] = useState<DashboardAd[]>(initialAds);
    const [adToDelete, setAdToDelete] = useState<DashboardAd | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [lastDeletedAd, setLastDeletedAd] = useState<DashboardAd | null>(null);
    const [undoLoading, setUndoLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleEdit(ad: DashboardAd) {
        router.push(`/dashboard/ads/${ad.id}/edit`);
    }

    function handleRequestDelete(ad: DashboardAd) {
        setAdToDelete(ad);
    }

    async function handleConfirmDelete() {
        if (!adToDelete) return;

        setDeleteLoading(true);
        setError(null);

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) throw new Error("You must be signed in to delete an ad.");

            const { error: updateError } = await supabase
                .from("ads")
                .update({ status: "deleted" })
                .eq("id", adToDelete.id)
                .eq("seller_id", user.id);

            if (updateError) throw updateError;

            setAds((prev) => prev.filter((ad) => ad.id !== adToDelete.id));
            setLastDeletedAd(adToDelete);
            setAdToDelete(null);
        } catch (err: any) {
            setError(err.message ?? "Failed to delete ad.");
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleUndoDelete() {
        if (!lastDeletedAd) return;

        setUndoLoading(true);
        setError(null);

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) throw new Error("You must be signed in to restore an ad.");

            const { error: updateError } = await supabase
                .from("ads")
                .update({ status: lastDeletedAd.status })
                .eq("id", lastDeletedAd.id)
                .eq("seller_id", user.id);

            if (updateError) throw updateError;

            setAds((prev) => [lastDeletedAd, ...prev]);
            setLastDeletedAd(null);
        } catch (err: any) {
            setError(err.message ?? "Failed to restore ad.");
        } finally {
            setUndoLoading(false);
        }
    }

    const hasAds = ads.length > 0;
    const canBoost = false;

    return (
        <div className="space-y-6">
            <Dialog
                open={!!adToDelete}
                onOpenChange={(open) => {
                    if (!open) setAdToDelete(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete ad</DialogTitle>
                        <DialogDescription>
                            This will move your ad to trash and hide it from buyers. You can
                            undo from this page for a short time after deleting.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-xs text-zinc-500">
                        Ad: <span className="font-medium text-zinc-900">{adToDelete?.title}</span>
                    </p>
                    <DialogFooter>
                        <DialogClose
                            type="button"
                            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            disabled={deleteLoading}
                        >
                            Cancel
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? "Deleting..." : "Delete ad"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {lastDeletedAd && (
                <div className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <span>"{lastDeletedAd.title}" was moved to trash.</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={undoLoading}
                        onClick={handleUndoDelete}
                    >
                        {undoLoading ? "Restoring..." : "Undo"}
                    </Button>
                </div>
            )}

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!hasAds ? (
                <div className="mx-auto flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-8 text-center sm:px-6 sm:py-10 max-w-md">
                    <p className="text-sm font-medium text-zinc-900">
                        You haven't published any ads yet.
                    </p>
                    <p className="max-w-sm text-xs text-zinc-500">
                        Create your first listing to reach buyers on Jootiya.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="md:hidden space-y-3">
                        {ads.map((ad) => (
                            <AdCard
                                key={ad.id}
                                ad={ad}
                                onEdit={() => handleEdit(ad)}
                                onDelete={() => handleRequestDelete(ad)}
                            />
                        ))}
                    </div>

                    <div className="hidden md:block overflow-hidden rounded-2xl border bg-white">
                        <table className="min-w-full divide-y divide-zinc-100 text-sm">
                            <thead className="bg-zinc-50">
                                <tr>
                                    <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 sm:pl-6">
                                        Ad
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                                        Price
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                                        Views
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500 sm:pr-6">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white">
                                {ads.map((ad) => (
                                    <AdRow
                                        key={ad.id}
                                        ad={ad}
                                        canBoost={canBoost}
                                        onEdit={() => handleEdit(ad)}
                                        onDelete={() => handleRequestDelete(ad)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
