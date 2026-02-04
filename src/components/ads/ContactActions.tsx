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
    const [showPhone, setShowPhone] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

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
                onClick={() => setShowPhone(!showPhone)}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all active:scale-[0.98] gap-3"
            >
                <Phone className="h-5 w-5" />
                {showPhone ? (sellerPhone || "06 XX XX XX XX") : "Afficher le numéro"}
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
