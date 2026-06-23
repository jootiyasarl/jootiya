"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, Heart, Lock, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

    const whatsappMessage = `Bonjour, j'ai vu votre annonce "${adTitle}" sur Jootiya ب ${adPrice} و أنا مهتم بها. هل لا زالت متوفرة؟`;
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
                    className="btn btn-primary flex-1 h-12 gap-2"
                >
                    <Phone className="w-4 h-4" />
                    Appeler
                </a>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success flex-1 h-12 gap-2"
                >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    WhatsApp
                </a>

                {/* Favorite Action */}
                <button
                    onClick={handleFavoriteClick}
                    disabled={isLoadingFav}
                    className={cn(
                        "btn btn-circle h-12 w-12 shrink-0",
                        isFavorite ? "btn-error text-white" : "btn-ghost text-zinc-500"
                    )}
                >
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </button>
            </div>
        </div>
    );
}
