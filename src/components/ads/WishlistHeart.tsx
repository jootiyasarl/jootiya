"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WishlistHeartProps {
    adId: string;
    className?: string;
}

export function WishlistHeart({ adId, className }: WishlistHeartProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Check if user is logged in and if ad is favorited
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setUserId(null);
                return;
            }

            setUserId(user.id);

            const { data } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq("ad_id", adId)
                .single();

            setIsFavorited(!!data);
        };

        checkFavoriteStatus();
    }, [adId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            toast.error("Veuillez vous connecter pour ajouter aux favoris");
            return;
        }

        setIsLoading(true);

        try {
            if (isFavorited) {
                // Remove from favorites
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", userId)
                    .eq("ad_id", adId);

                if (error) throw error;

                setIsFavorited(false);
                toast.success("Retiré des favoris");
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from("favorites")
                    .insert({ user_id: userId, ad_id: adId });

                if (error) throw error;

                setIsFavorited(true);
                toast.success("Ajouté aux favoris");
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            toast.error("Une erreur s'est produite");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={cn(
                "absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-soft",
                "hover:scale-110 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isFavorited
                        ? "fill-[#FF6B00] text-[#FF6B00] scale-110"
                        : "text-zinc-600 dark:text-zinc-400"
                )}
                strokeWidth={2}
            />
        </button>
    );
}
