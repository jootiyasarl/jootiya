"use client";

import { useState } from "react";
import { Star, Check, Trash2, User, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    status: string;
    ad_id: string;
    ads: { title: string };
    buyer: { full_name: string; avatar_url: string };
    seller: { full_name: string; avatar_url: string };
}

interface ReviewModerationListProps {
    initialReviews: Review[];
}

export function ReviewModerationList({ initialReviews }: ReviewModerationListProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [actionId, setActionId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        setActionId(id);
        try {
            const { error } = await supabase
                .from("reviews")
                .update({ status: "approved" })
                .eq("id", id);

            if (error) throw error;

            toast.success("Avis approuvé !");
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error: any) {
            toast.error("Erreur lors de l'approbation.");
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;

        setActionId(id);
        try {
            const { error } = await supabase
                .from("reviews")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Avis supprimé !");
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error: any) {
            toast.error("Erreur lors de la suppression.");
        } finally {
            setActionId(null);
        }
    };

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
                <Check className="w-12 h-12 text-emerald-500 mb-4 opacity-20" />
                <p className="text-zinc-400 font-medium tracking-tight">Aucun avis en attente de modération.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Review Content */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex text-yellow-500 gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-current" : "text-zinc-700")} />
                                    ))}
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                                    {format(new Date(review.created_at), "dd MMM yyyy HH:mm")}
                                </span>
                            </div>

                            <p className="text-zinc-200 text-sm leading-relaxed italic">
                                "{review.comment || "Pas de commentaire"}"
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <Link
                                    href={`/ads/${review.ad_id}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-tight"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Sur l'annonce: {review.ads?.title}
                                </Link>
                            </div>
                        </div>

                        {/* Parties Involved */}
                        <div className="w-full md:w-64 space-y-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Acheteur</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                                        {review.buyer?.avatar_url ? (
                                            <Image src={review.buyer.avatar_url} alt="B" width={24} height={24} className="object-cover" />
                                        ) : (
                                            <User className="w-3 h-3 text-zinc-600" />
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-zinc-300">{review.buyer?.full_name}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Vendeur</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                                        {review.seller?.avatar_url ? (
                                            <Image src={review.seller.avatar_url} alt="S" width={24} height={24} className="object-cover" />
                                        ) : (
                                            <User className="w-3 h-3 text-zinc-600" />
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-zinc-300">{review.seller?.full_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 justify-end">
                            <Button
                                onClick={() => handleApprove(review.id)}
                                disabled={!!actionId}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex-1 md:flex-none shadow-lg shadow-emerald-900/20"
                            >
                                {actionId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                Approuver
                            </Button>
                            <Button
                                onClick={() => handleReject(review.id)}
                                disabled={!!actionId}
                                variant="destructive"
                                className="font-bold text-xs h-10 px-4 rounded-xl flex-1 md:flex-none"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Rejeter
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Shorthand for cn
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
