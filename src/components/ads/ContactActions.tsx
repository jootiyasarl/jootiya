"use client";

// Imports updated
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, AlertCircle, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ContactActionsProps {
    adId: string;
    sellerId: string;
    sellerPhone?: string;
    currentUser: any;
}

export function ContactActions({ adId, sellerId, sellerPhone, currentUser }: ContactActionsProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleWhatsAppClick = () => {
        if (!sellerPhone) {
            alert("Numéro de téléphone non disponible.");
            return;
        }
        // Keep only digits
        const cleanPhone = sellerPhone.replace(/\D/g, '');
        // Format for WhatsApp: if it's a local Moroccan number (06... or 07...), prepend 212
        const formatPhone = (cleanPhone.startsWith('0') && cleanPhone.length === 10)
            ? '212' + cleanPhone.substring(1)
            : cleanPhone;

        window.open(`https://wa.me/${formatPhone}`, '_blank');
    };

    const handleQuickMessage = async () => {
        if (!currentUser) {
            router.push(`/login?redirectTo=/ads/${adId}`);
            return;
        }

        // Prevent messaging self
        if (currentUser.id === sellerId) {
            alert("Vous ne pouvez pas vous envoyer un message à vous-même.");
            setIsOpen(false);
            return;
        }

        if (!message.trim()) return;

        setIsSending(true);

        try {
            // 1. Get or Create Conversation
            let conversationId;
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .eq('ad_id', adId)
                .eq('buyer_id', currentUser.id)
                .eq('seller_id', sellerId)
                .single();

            if (existingConv) {
                conversationId = existingConv.id;
            } else {
                const { data: newConv, error: insertConvError } = await supabase
                    .from('conversations')
                    .insert({
                        ad_id: adId,
                        buyer_id: currentUser.id,
                        seller_id: sellerId
                    })
                    .select('id')
                    .single();

                if (insertConvError) throw insertConvError;
                conversationId = newConv.id;
            }

            // 2. Send Message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: currentUser.id,
                    content: message.trim()
                });

            if (msgError) throw msgError;

            // Success feedback
            setIsOpen(false);
            setMessage("");
            // Optional: Redirect to chat or show toast
            // For now, we redirect to full chat to continue conversation
            router.push(`/dashboard/messages?id=${conversationId}`);

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Erreur lors de l'envoi du message.");
        } finally {
            setIsSending(false);
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

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger className="w-full h-14 text-lg font-semibold rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98] gap-3 flex items-center justify-center text-zinc-900 bg-white shadow-sm">
                    <MessageCircle className="h-5 w-5" />
                    Envoyer un message
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white rounded-3xl border-zinc-100 shadow-2xl p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <MessageCircle className="h-5 w-5" />
                            </span>
                            Envoyer un message rapide
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Écrivez votre message au vendeur. Il le recevra instantanément.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-2 space-y-4">
                        <Textarea
                            placeholder="Bonjour, je suis intéressé par votre annonce..."
                            className="min-h-[120px] resize-none rounded-xl bg-zinc-50 border-zinc-200 focus:border-orange-500 text-[16px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {["Est-ce toujours disponible ?", "Quel est votre dernier prix ?", "Quand peut-on se voir ?"].map(quick => (
                                <button
                                    key={quick}
                                    onClick={() => setMessage(quick)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full text-xs font-medium transition-colors"
                                >
                                    {quick}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-zinc-50 border-t border-zinc-100 sm:justify-between flex-row items-center gap-2">
                        <span className="text-[10px] text-zinc-400 pl-2 hidden sm:block">
                            Appuyez sur Envoyer pour démarrer la discussion
                        </span>
                        <Button
                            onClick={handleQuickMessage}
                            disabled={!message.trim() || isSending}
                            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-6"
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Envoyer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
