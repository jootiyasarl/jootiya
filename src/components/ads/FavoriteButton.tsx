"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/app/ads/actions";

interface FavoriteButtonProps {
    adId: string;
    initialIsFavorite?: boolean;
    className?: string;
}

export function FavoriteButton({ adId, initialIsFavorite = false, className }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;

            const { data, error } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq("ad_id", adId)
                .maybeSingle();

            if (!error && data) {
                setIsFavorite(true);
            }
        };

        checkFavorite();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkFavorite();
            } else if (event === 'SIGNED_OUT') {
                setIsFavorite(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [adId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        try {
            const result = await toggleFavoriteAction(adId);
            
            if (result.error) {
                toast.error(result.error);
            } else {
                setIsFavorite(result.isFavorite ?? false);
                toast.success(result.isFavorite ? "Ajouté aux favoris" : "Retiré des favoris");
            }
        } catch (err: any) {
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={cn(
                "p-2 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center",
                isFavorite
                    ? "bg-red-50 text-red-500 scale-110"
                    : "bg-white/80 backdrop-blur-sm text-zinc-400 hover:text-red-500 hover:bg-red-50",
                className
            )}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isFavorite ? "fill-current" : ""
                )}
            />
        </button>
    );
}
