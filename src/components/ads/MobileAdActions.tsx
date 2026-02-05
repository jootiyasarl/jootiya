"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface MobileAdActionsProps {
    adId: string;
    sellerId: string;
    sellerPhone?: string;
    currentUser: any;
}

export function MobileAdActions({ adId, sellerId, sellerPhone, currentUser }: MobileAdActionsProps) {
    const router = useRouter();
    const [showPhone, setShowPhone] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoadingFav, setIsLoadingFav] = useState(false);

    // Check if ad is favorited on mount
    useEffect(() => {
        if (currentUser) {
            checkFavoriteStatus();
        }
    }, [currentUser, adId]);

    const checkFavoriteStatus = async () => {
        const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('ad_id', adId)
            .eq('user_id', currentUser.id)
            .single();
        setIsFavorite(!!data);
    };

    const handleCallClick = () => {
        setShowPhone(!showPhone);
        if (!showPhone && sellerPhone) {
            window.location.href = `tel:${sellerPhone.replace(/\s/g, '')}`;
        }
    };

    const handleMessageClick = async () => {
        if (!currentUser) {
            router.push(`/login?redirectTo=/ads/${adId}`);
            return;
        }

        if (currentUser.id === sellerId) {
            alert("Vous ne pouvez pas vous envoyer un message à vous-même.");
            return;
        }

        setIsCreatingChat(true);
        try {
            // Check existing conversation
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .eq('ad_id', adId)
                .eq('buyer_id', currentUser.id)
                .eq('seller_id', sellerId)
                .single();

            if (existingConv) {
                router.push(`/dashboard/messages?id=${existingConv.id}`);
                return;
            }

            // Create new conversation
            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert({
                    ad_id: adId,
                    buyer_id: currentUser.id,
                    seller_id: sellerId
                })
                .select('id')
                .single();

            if (error) throw error;
            router.push(`/dashboard/messages?id=${newConv.id}`);
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Erreur lors de l'ouverture du chat.");
        } finally {
            setIsCreatingChat(false);
        }
    };

    const handleFavoriteClick = async () => {
        if (!currentUser) {
            router.push(`/login?redirectTo=/ads/${adId}`);
            return;
        }

        setIsLoadingFav(true);
        try {
            if (isFavorite) {
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('ad_id', adId)
                    .eq('user_id', currentUser.id);
                setIsFavorite(false);
            } else {
                await supabase
                    .from('favorites')
                    .insert({
                        ad_id: adId,
                        user_id: currentUser.id
                    });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setIsLoadingFav(false);
        }
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-zinc-100 p-4 pb-safe-bottom shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <div className="mx-auto max-w-7xl flex gap-3">
                <Button
                    onClick={handleCallClick}
                    className="flex-1 h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-lg shadow-zinc-900/10 transition-all active:scale-95"
                >
                    {showPhone ? (sellerPhone || "06 XX XX XX XX") : "Appeler maintenant"}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleMessageClick}
                    disabled={isCreatingChat}
                    className="h-14 w-14 rounded-2xl border-zinc-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                    <MessageCircle className={cn("h-6 w-6", isCreatingChat && "animate-pulse")} />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFavoriteClick}
                    disabled={isLoadingFav}
                    className={cn(
                        "h-14 w-14 rounded-2xl border-zinc-200 transition-colors",
                        isFavorite ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100" : "hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                    )}
                >
                    <Heart className={cn("h-6 w-6", isFavorite && "fill-current")} />
                </Button>
            </div>
        </div>
    );
}
