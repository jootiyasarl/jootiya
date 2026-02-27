"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/app/ads/actions";

interface WishlistHeartProps {
    adId: string;
    className?: string;
}

export function WishlistHeart({ adId, className }: WishlistHeartProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", session.user.id)
                .eq("ad_id", adId)
                .maybeSingle();

            setIsFavorited(!!data);
        };

        checkFavoriteStatus();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkFavoriteStatus();
            } else if (event === 'SIGNED_OUT') {
                setIsFavorited(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [adId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        try {
            const result = await toggleFavoriteAction(adId);
            
            if (result.error) {
                toast.error(result.error);
            } else {
                setIsFavorited(result.isFavorite ?? false);
                toast.success(result.isFavorite ? "Ajouté aux favoris" : "Retiré des favoris");
            }
        } catch (err: any) {
            toast.error("Une erreur est survenue");
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
