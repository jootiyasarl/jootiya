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
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isCheckingSub, setIsCheckingSub] = useState(true);

    useEffect(() => {
        const checkSubscription = () => {
            const savedSub = localStorage.getItem("jootiya_notif_subscribed") === "true";
            const permissionGranted = typeof window !== "undefined" && Notification.permission === "granted";
            setIsSubscribed(savedSub && permissionGranted);
            setIsCheckingSub(false);
        };
        checkSubscription();
    }, []);

    const handleSubscribeAndReveal = async () => {
        if (!("Notification" in window)) {
            setIsSubscribed(true);
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                localStorage.setItem("jootiya_notif_subscribed", "true");
                setIsSubscribed(true);
                toast.success("Notifications activées !");
                
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                    });

                    console.log("Push Subscription Object:", JSON.stringify(subscription));

                    await fetch("/api/notifications/save-subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            subscription: subscription,
                            user_id: currentUser?.id
                        }),
                    });
                } catch (subErr) {
                    console.error("Error creating push subscription:", subErr);
                }
            } else {
                toast.error("Veuillez activer les notifications pour voir le numéro.");
            }
        } catch (error) {
            console.error("Subscription error:", error);
        }
    };

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

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
            {!isSubscribed && !isCheckingSub ? (
                <div className="flex gap-2 w-full items-center">
                    <Button
                        onClick={handleSubscribeAndReveal}
                        className="flex-1 h-14 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 animate-pulse shadow-md shadow-orange-200 dark:shadow-none text-[12px] uppercase tracking-tighter leading-none"
                    >
                        <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            <BellRing className="w-3.5 h-3.5" />
                        </div>
                        <span>إظهار رقم الهاتف (تطلب تفعيل التنبيهات) 🔔</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFavoriteClick}
                        disabled={isLoadingFav}
                        className={cn(
                            "h-14 w-14 rounded-xl shrink-0 transition-all active:scale-90",
                            isFavorite ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-zinc-500 bg-zinc-50 dark:bg-zinc-800"
                        )}
                    >
                        <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                    </Button>
                </div>
            ) : (
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
            )}
        </div>
    );
}
