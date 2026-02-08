"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Conversation } from "@/types/messaging";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Smile, MoreVertical, CheckCheck, Loader2, ChevronLeft, Mic } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { generateSmartReplies } from "@/lib/smartReplies";
import { ChatAudioRecorder } from "./ChatAudioRecorder";
import { ChatAudioPlayer } from "./ChatAudioPlayer";
import { toast } from "sonner";

interface ChatWindowProps {
    conversation: Conversation;
    currentUser: any;
    onMessageSent: (message: Message) => void;
    onBack: () => void;
}

const QUICK_REPLIES = [
    "Salam, dispo ?",
    "Prix final ?",
    "Localisation ?",
    "Je suis intéressé !"
];

export function ChatWindow({ conversation, currentUser, onMessageSent, onBack }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false); // Simulator for now
    const [showAudioRecorder, setShowAudioRecorder] = useState(false);

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
                    schema: 'public',
                    table: 'messages',
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

    const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string, audioUrl?: string) => {
        e?.preventDefault();
        const content = contentOverride || newMessage.trim();
        const messageType = audioUrl ? 'audio' : 'text';

        if (!content && !audioUrl) return;

        setIsSending(true);
        const { data, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversation.id,
                sender_id: currentUser.id,
                content: audioUrl ? "Audio message" : content,
                message_type: messageType,
                file_url: audioUrl || null
            })
            .select()
            .single();

        if (error) {
            console.error("Error sending message:", error);
            toast.error("Erreur lors de l'envoi de la message.");
        } else if (data) {
            setNewMessage("");
            setShowAudioRecorder(false);
            onMessageSent(data as Message);
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 p-3 md:p-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Back Button for Mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="md:hidden -ml-2 text-zinc-500 h-9 w-9"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    -
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-zinc-100">
                        <AvatarImage src={conversation.other_party?.avatar_url || ""} />
                        <AvatarFallback>{conversation.other_party?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-zinc-900 leading-none text-sm md:text-base">
                            {conversation.other_party?.full_name || "Utilisateur Jootiya"}
                        </h3>
                        {/* Online Indicator simulation */}
                        <div className="flex items-center gap-1 mt-1 md:mt-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span className="text-[10px] md:text-xs text-zinc-400 font-medium">En ligne</span>
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
                                    <div className={cn("flex flex-col max-w-[90%] md:max-w-[70%]", isMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "px-3 py-2 md:px-4 md:py-2.5 shadow-sm text-sm md:text-[15px] leading-relaxed break-words",
                                            isMe
                                                ? "bg-orange-500 text-white rounded-2xl rounded-tr-sm"
                                                : "bg-white border border-zinc-100 text-zinc-800 rounded-2xl rounded-tl-sm"
                                        )}>
                                            {msg.message_type === 'audio' ? (
                                                <ChatAudioPlayer url={msg.file_url || ""} isMe={isMe} />
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 px-1">
                                            <span className="text-[9px] md:text-[10px] text-zinc-400 font-medium">
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
            <div className="px-3 md:px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right">
                {/* Buyer Quick Replies */}
                {currentUser.id !== conversation.seller_id && QUICK_REPLIES.map((reply) => (
                    <button
                        key={reply}
                        onClick={() => handleSendMessage(undefined, reply)}
                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-zinc-200 hover:border-orange-200 hover:bg-orange-50 text-zinc-600 hover:text-orange-600 rounded-full text-[11px] md:text-xs font-bold transition-all shadow-sm active:scale-95"
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
                            className="whitespace-nowrap px-3 py-1.5 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 rounded-full text-[11px] md:text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                        >
                            <span className="text-orange-500">✨</span> {reply}
                        </button>
                    ))}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white border-t border-zinc-100 sticky bottom-0">
                <div className="flex items-end gap-2">
                    {showAudioRecorder ? (
                        <ChatAudioRecorder
                            onSend={(url) => handleSendMessage(undefined, undefined, url)}
                            onCancel={() => setShowAudioRecorder(false)}
                        />
                    ) : (
                        <form onSubmit={(e) => handleSendMessage(e)} className="flex-1 flex items-end gap-2 bg-zinc-50 p-1.5 md:p-2 rounded-3xl border border-zinc-200 focus-within:border-orange-500 transition-all">
                            <Button type="button" size="icon" variant="ghost" className="h-9 w-9 md:h-10 md:w-10 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-white shrink-0">
                                <Paperclip className="h-5 w-5" />
                            </Button>

                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Message..."
                                className="flex-1 bg-transparent border-none focus-visible:ring-0 px-1 py-2 font-medium placeholder:text-zinc-400 text-sm md:text-base"
                                onFocus={() => setShowAudioRecorder(false)}
                            />

                            {newMessage.trim() ? (
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isSending}
                                    className="h-9 w-9 md:h-10 md:w-10 rounded-full shrink-0 bg-orange-500 text-white transition-all"
                                >
                                    {isSending ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <Send className="h-4 w-4 md:h-5 md:w-5 ml-0.5" />}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setShowAudioRecorder(true)}
                                    className="h-9 w-9 md:h-10 md:w-10 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-50 shrink-0"
                                >
                                    <Mic className="h-5 w-5" />
                                </Button>
                            )}
                        </form>
                    )}
                </div>
                <div className="text-center mt-1 hidden md:block">
                    <p className="text-[10px] text-zinc-400">
                        {showAudioRecorder ? "Lâchez pour envoyer, glissez pour annuler" : "Appuyez sur Entrée pour envoyer"}
                    </p>
                </div>
            </div>
        </div>
    );
}
