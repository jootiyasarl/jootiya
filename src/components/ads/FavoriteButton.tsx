"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
            const { data: { user } } = await supabase.auth.getUser();
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

        if (initialIsFavorite === undefined) {
            checkFavorite();
        }
    }, [adId, initialIsFavorite]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Veuillez vous connecter pour ajouter des favoris");
            setLoading(false);
            return;
        }

        if (isFavorite) {
            const { error } = await supabase
                .from("favorites")
                .delete()
                .eq("user_id", user.id)
                .eq("ad_id", adId);

            if (error) {
                toast.error("Erreur lors della suppression");
            } else {
                setIsFavorite(false);
                toast.success("Retiré des favoris");
            }
        } else {
            const { error } = await supabase
                .from("favorites")
                .insert({ user_id: user.id, ad_id: adId });

            if (error) {
                if (error.code === '23505') {
                    setIsFavorite(true);
                } else {
                    toast.error("Erreur lors de l'ajout");
                }
            } else {
                setIsFavorite(true);
                toast.success("Ajouté aux favoris");
            }
        }
        setLoading(false);
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
