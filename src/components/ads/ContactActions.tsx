"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface ContactActionsProps {
    adId: string;
    sellerId: string;
    sellerPhone?: string;
    currentUser: any;
}

export function ContactActions({ adId, sellerId, sellerPhone, currentUser }: ContactActionsProps) {
    const router = useRouter();
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const handleWhatsAppClick = () => {
        if (!sellerPhone) {
            alert("Numéro de téléphone non disponible.");
            return;
        }
        const cleanPhone = sellerPhone.replace(/[\s\-\(\)]/g, '');
        const formatPhone = cleanPhone.startsWith('0') ? '212' + cleanPhone.substring(1) : cleanPhone;
        window.open(`https://wa.me/${formatPhone}`, '_blank');
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
            // 1. Check if conversation already exists
            const { data: existingConv, error: fetchError } = await supabase
                .from('conversations')
                .select('id')
                .eq('ad_id', adId)
                .eq('buyer_id', currentUser.id)
                .eq('seller_id', sellerId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'no rows found'
                throw fetchError;
            }

            if (existingConv) {
                router.push(`/dashboard/messages?id=${existingConv.id}`);
                return;
            }

            // 2. Create new conversation
            const { data: newConv, error: insertError } = await supabase
                .from('conversations')
                .insert({
                    ad_id: adId,
                    buyer_id: currentUser.id,
                    seller_id: sellerId
                })
                .select('id')
                .single();

            if (insertError) throw insertError;

            router.push(`/dashboard/messages?id=${newConv.id}`);
        } catch (error: any) {
            console.error("Error creating conversation:", error);
            alert("Impossible de démarrer la discussion. Veuillez réessayer.");
        } finally {
            setIsCreatingChat(false);
        }
    };

    return (
        <div className="space-y-3">
            <Button
                onClick={handleWhatsAppClick}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg transition-all active:scale-[0.98] gap-3"
            >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                WhatsApp
            </Button>

            <Button
                variant="outline"
                onClick={handleMessageClick}
                disabled={isCreatingChat}
                className="w-full h-14 text-lg font-semibold rounded-2xl border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98] gap-3"
            >
                <MessageCircle className={cn("h-5 w-5", isCreatingChat && "animate-pulse")} />
                {isCreatingChat ? "Ouverture..." : "Envoyer un message"}
            </Button>
        </div>
    );
}
