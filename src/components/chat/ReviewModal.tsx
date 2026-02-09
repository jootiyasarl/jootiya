"use client";

import { useState } from "react";
import { Star, X, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    sellerId: string;
    adId: string;
    buyerId: string;
    onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, sellerId, adId, buyerId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState<number>(0);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Veuillez choisir une note (étoiles).");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("reviews")
                .insert({
                    seller_id: sellerId,
                    buyer_id: buyerId,
                    ad_id: adId,
                    rating: rating,
                    comment: comment.trim()
                });

            if (error) {
                if (error.code === "23505") {
                    toast.error("Vous avez déjà évalué ce vendeur pour cet article.");
                } else {
                    throw error;
                }
            } else {
                toast.success("Merci ! Votre avis a été publié.");
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error("Error submitting review:", error);
            toast.error("Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-zinc-900">Évaluer le vendeur</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                            <X className="h-5 w-5 text-zinc-400" />
                        </Button>
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-8">
                        <p className="text-sm text-zinc-500 font-medium">Quelle note donneriez-vous ?</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="relative transition-transform active:scale-90"
                                >
                                    <Star
                                        className={cn(
                                            "w-10 h-10 transition-colors",
                                            (hoveredRating || rating) >= star
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-zinc-200"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                                Votre avis (Optionnel)
                            </label>
                            <Textarea
                                placeholder="Partagez votre expérience avec ce vendeur..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="resize-none min-h-[100px] rounded-2xl border-zinc-100 focus:ring-orange-500"
                            />
                        </div>

                        <Button
                            className="w-full h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 font-bold text-white shadow-lg shadow-orange-600/20 gap-2"
                            disabled={isSubmitting || rating === 0}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Publier l'avis
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="bg-zinc-50 p-4 text-center">
                    <p className="text-[10px] text-zinc-400 leading-tight">
                        Votre avis aide la communauté Jootiya à identifier les vendeurs de confiance.
                    </p>
                </div>
            </div>
        </div>
    );
}
