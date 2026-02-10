"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface QuickActionFooterProps {
    phone: string;
    adTitle: string;
    adId: string;
    sellerId: string;
    currentUser: any;
}

export function QuickActionFooter({ phone, adTitle, adId, sellerId, currentUser }: QuickActionFooterProps) {
    const router = useRouter();
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoadingFav, setIsLoadingFav] = useState(false);

    const whatsappUrl = `https://wa.me/${phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé par votre annonce "${adTitle}" sur Jootiya.`
    )}`;

    // Check favorite status on mount
    useEffect(() => {
        if (currentUser) {
            const checkFavoriteStatus = async () => {
                const { data } = await supabase
                    .from('favorites')
                    .select('id')
                    .eq('ad_id', adId)
                    .eq('user_id', currentUser.id)
                    .single();
                setIsFavorite(!!data);
            };
            checkFavoriteStatus();
        }
    }, [currentUser, adId]);

    const handleMessageClick = async () => {
        if (!currentUser) {
            router.push(`/login?redirectTo=/ads/${adId}`);
            return;
        }

        if (currentUser.id === sellerId) {
            // Optional: toast notification
            return;
        }

        setIsCreatingChat(true);
        try {
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
                    .insert({ ad_id: adId, user_id: currentUser.id });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setIsLoadingFav(false);
        }
    };

    return (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-zinc-100 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] animate-in slide-in-from-bottom duration-300">
            <div className="flex gap-2 max-w-md mx-auto items-center">
                {/* Main Contact Buttons */}
                <a
                    href={`tel:${phone}`}
                    className="flex-1 min-h-[44px] h-12 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-orange-200 text-xs uppercase"
                >
                    <Phone className="w-4 h-4" />
                    اتصال
                </a>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[44px] h-12 border-2 border-green-600 text-green-600 hover:bg-green-50 font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase"
                >
                    <MessageCircle className="w-4 h-4" />
                    واتساب
                </a>

                {/* Icon Actions */}
                <div className="flex gap-1 pl-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleMessageClick}
                        disabled={isCreatingChat}
                        className="h-12 w-12 rounded-xl text-zinc-500 hover:bg-zinc-100 min-h-[44px] min-w-[44px]"
                    >
                        <MessageCircle className={cn("h-5 w-5", isCreatingChat && "animate-pulse")} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFavoriteClick}
                        disabled={isLoadingFav}
                        className={cn(
                            "h-12 w-12 rounded-xl min-h-[44px] min-w-[44px]",
                            isFavorite ? "text-red-500 bg-red-50" : "text-zinc-500 hover:bg-zinc-100"
                        )}
                    >
                        <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
