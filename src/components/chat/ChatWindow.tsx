"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Conversation } from "@/types/messaging";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Smile, MoreVertical, CheckCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { generateSmartReplies } from "@/lib/smartReplies";

interface ChatWindowProps {
    conversation: Conversation;
    currentUser: any;
    onMessageSent: (message: Message) => void;
}

const QUICK_REPLIES = [
    "Salam, dispo ?",
    "Prix final ?",
    "Localisation ?",
    "Je suis intéressé !"
];

export function ChatWindow({ conversation, currentUser, onMessageSent }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false); // Simulator for now

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversation.id)
                .order("created_at", { ascending: true });

            if (!error && data) {
                setMessages(data as Message[]);
            }
            setIsLoading(false);
        };

        fetchMessages();

        // Real-time subscription
        const channel = supabase
            .channel(`room:${conversation.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversation.id}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                    // Call parent to update conversation list last_message
                    // (Optimization: only if it's not our own message, but here we just pass it)
                    // Actually, we might receive our own message via subscription too depending on how we insert.
                    // For now, let's assume we handle our own optimistic update or just rely on subscription.
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversation.id]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string) => {
        e?.preventDefault();
        const content = contentOverride || newMessage.trim();
        if (!content) return;

        // Optimistic Update (optional, but good for UX)
        // For now, we wait for DB to be safe.

        setIsSending(true);
        const { data, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversation.id,
                sender_id: currentUser.id,
                content: content,
            })
            .select()
            .single();

        if (error) {
            console.error("Error sending message:", error);
            alert("Erreur lors de l'envoi.");
        } else if (data) {
            setNewMessage("");
            onMessageSent(data as Message);
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-zinc-100">
                        <AvatarImage src={conversation.other_party?.avatar_url || ""} />
                        <AvatarFallback>{conversation.other_party?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-zinc-900 leading-none">
                            {conversation.other_party?.full_name || "Utilisateur Jootiya"}
                        </h3>
                        {/* Online Indicator simulation */}
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-zinc-400 font-medium">En ligne</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={`/ads/${conversation.ad_id}`} className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-100">
                        {conversation.ad?.image_urls?.[0] && (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                                <Image
                                    src={conversation.ad.image_urls[0]}
                                    alt={conversation.ad.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="flex flex-col max-w-[120px]">
                            <span className="text-xs font-bold text-zinc-900 truncate">{conversation.ad?.title}</span>
                            <span className="text-[10px] text-zinc-500">Voir l&apos;annonce</span>
                        </div>
                    </Link>

                    <Button variant="ghost" size="icon" className="text-zinc-400">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-4 sm:p-6">
                <div className="space-y-6">
                    {/* Timestamp separator example */}
                    <div className="flex justify-center">
                        <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Aujourd&apos;hui
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-zinc-400 text-sm">Démarrez la conversation avec {conversation.other_party?.full_name}</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === currentUser.id;
                            const isNextSame = messages[i + 1]?.sender_id === msg.sender_id;

                            return (
                                <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn("flex flex-col max-w-[85%] sm:max-w-[70%]", isMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words",
                                            isMe
                                                ? "bg-orange-500 text-white rounded-2xl rounded-tr-sm"
                                                : "bg-white border border-zinc-100 text-zinc-800 rounded-2xl rounded-tl-sm"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 px-1">
                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                {format(new Date(msg.created_at), "HH:mm")}
                                            </span>
                                            {isMe && (
                                                <CheckCheck className="h-3 w-3 text-orange-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Smart Suggestions / Quick Replies */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right">
                {/* Buyer Quick Replies */}
                {currentUser.id !== conversation.seller_id && QUICK_REPLIES.map((reply) => (
                    <button
                        key={reply}
                        onClick={() => handleSendMessage(undefined, reply)}
                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-zinc-200 hover:border-orange-200 hover:bg-orange-50 text-zinc-600 hover:text-orange-600 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        {reply}
                    </button>
                ))}

                {/* Seller Smart Suggestions */}
                {currentUser.id === conversation.seller_id && messages.length > 0 && messages[messages.length - 1].sender_id !== currentUser.id &&
                    generateSmartReplies(messages[messages.length - 1].content).map((reply) => (
                        <button
                            key={reply}
                            onClick={() => handleSendMessage(undefined, reply)}
                            className="whitespace-nowrap px-3 py-1.5 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                        >
                            <span className="text-orange-500">✨</span> {reply}
                        </button>
                    ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-zinc-100">
                <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-2 bg-zinc-50 p-2 rounded-3xl border border-zinc-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-white shrink-0">
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez un message..."
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 min-h-[40px] max-h-[120px] py-2.5 font-medium placeholder:text-zinc-400"
                    />

                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-white shrink-0">
                        <Smile className="h-5 w-5" />
                    </Button>

                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "h-10 w-10 rounded-full shrink-0 transition-all shadow-lg shadow-orange-500/20",
                            newMessage.trim() ? "bg-orange-500 hover:bg-orange-600 text-white scale-100" : "bg-zinc-200 text-zinc-400 scale-90"
                        )}
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                    </Button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-zinc-400">Appuyez sur Entrée pour envoyer</p>
                </div>
            </div>
        </div>
    );
}
