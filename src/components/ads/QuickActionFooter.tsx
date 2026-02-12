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
    adPrice: string;
    adId: string;
    sellerId: string;
    currentUser: any;
}

export function QuickActionFooter({ phone, adTitle, adPrice, adId, sellerId, currentUser }: QuickActionFooterProps) {
    const router = useRouter();
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoadingFav, setIsLoadingFav] = useState(false);

    // Format Moroccan phone number for WhatsApp
    const cleanPhone = phone?.replace(/\D/g, '');
    const formatPhone = (cleanPhone?.startsWith('0') && cleanPhone.length === 10)
        ? '212' + cleanPhone.substring(1)
        : cleanPhone;

    const whatsappMessage = `السلام عليكم، شفت الإعلان ديالك ${adTitle} في تطبيق Jootiya بـ ${adPrice} وعجبني. واش مزال موجود؟`;
    const whatsappUrl = `https://wa.me/${formatPhone}?text=${encodeURIComponent(whatsappMessage)}`;

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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300 safe-area-bottom">
            <div className="flex gap-2 w-full items-center">
                {/* Main Contact Buttons */}
                <a
                    href={`tel:${phone}`}
                    className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-orange-200 dark:shadow-none text-[13px] uppercase tracking-tight"
                >
                    <Phone className="w-4 h-4" />
                    Appeler
                </a>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-12 bg-[#25D366] hover:bg-[#22c35e] text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-green-100 dark:shadow-none text-[13px] uppercase tracking-tight"
                >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    WhatsApp
                </a>

                {/* Favorite Action */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFavoriteClick}
                    disabled={isLoadingFav}
                    className={cn(
                        "h-12 w-12 rounded-xl shrink-0 transition-all active:scale-90",
                        isFavorite ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-zinc-500 bg-zinc-50 dark:bg-zinc-800"
                    )}
                >
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </Button>
            </div>
        </div>
    );
}
