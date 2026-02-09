"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Conversation } from "@/types/messaging";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Smile, MoreVertical, CheckCheck, Loader2, ChevronLeft, Mic, Camera } from "lucide-react";
import { format } from "date-fns";
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
    const [showAudioRecorder, setShowAudioRecorder] = useState(false);
    const [recorderCoords, setRecorderCoords] = useState<{ x: number, y: number } | undefined>(undefined);

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
                    setMessages((prev) => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversation.id]);

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

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            conversation_id: conversation.id,
            sender_id: currentUser.id,
            content: audioUrl ? "Audio message" : content,
            message_type: messageType,
            file_url: audioUrl || undefined,
            is_read: false,
            created_at: new Date().toISOString(),
            is_optimistic: true // Custom flag for UI
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        if (!audioUrl) setNewMessage("");

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
            toast.error("Erreur lors de l'envoi du message.");
            // Remove optimistic message on error
            setMessages((prev) => prev.filter(m => m.id !== tempId));
        } else if (data) {
            // Replace optimistic message with real one
            setMessages((prev) => prev.map(m => m.id === tempId ? data as Message : m));
            setShowAudioRecorder(false);
            onMessageSent(data as Message);
        }
        setIsSending(false);
    };

    const handleMicStart = (e: React.MouseEvent | React.TouchEvent) => {
        const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setRecorderCoords({ x, y });
        setShowAudioRecorder(true);
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] relative">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 p-3 md:p-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2 text-zinc-500 h-9 w-9">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-zinc-100">
                        <AvatarImage src={conversation.other_party?.avatar_url || ""} />
                        <AvatarFallback>{conversation.other_party?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-zinc-900 leading-none text-sm md:text-base">
                            {conversation.other_party?.full_name || "Utilisateur"}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span className="text-[10px] md:text-xs text-zinc-400 font-medium">En ligne</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-zinc-400">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-4 sm:p-6">
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-zinc-400 text-sm">Démarrez la conversation</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === currentUser.id;
                            return (
                                <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start", msg.is_optimistic && "opacity-70")}>
                                    <div className={cn("flex flex-col max-w-[90%] md:max-w-[70%]", isMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "px-3 py-2 md:px-4 md:py-2 shadow-sm text-sm md:text-[15px] leading-relaxed break-words relative",
                                            isMe ? "bg-orange-500 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-zinc-100 text-zinc-800 rounded-2xl rounded-tl-sm"
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
                                                msg.is_optimistic ? (
                                                    <Loader2 className="h-3 w-3 text-zinc-300 animate-spin" />
                                                ) : (
                                                    <CheckCheck className="h-3 w-3 text-orange-500" />
                                                )
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

            {/* Quick Replies */}
            <div className="px-3 md:px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {currentUser.id !== conversation.seller_id && QUICK_REPLIES.map((reply) => (
                    <button key={reply} onClick={() => handleSendMessage(undefined, reply)} className="whitespace-nowrap px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-[11px] font-bold shadow-sm">
                        {reply}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-2 md:p-3 bg-zinc-100/50 backdrop-blur-sm border-t border-zinc-200 z-50 sticky bottom-0">
                <div className="flex items-end gap-2 w-full max-w-full">
                    <div className="flex-1 flex items-center gap-1 bg-white rounded-[24px] shadow-sm border border-zinc-200 min-h-[48px] px-1 relative">
                        {showAudioRecorder ? (
                            <ChatAudioRecorder
                                onSend={(url) => handleSendMessage(undefined, undefined, url)}
                                onCancel={() => setShowAudioRecorder(false)}
                                initialX={recorderCoords?.x}
                                initialY={recorderCoords?.y}
                            />
                        ) : (
                            <>
                                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-zinc-500 rounded-full shrink-0">
                                    <Smile className="h-6 w-6" />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 py-3 font-medium text-[16px] min-w-0"
                                />
                                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-zinc-500 rounded-full shrink-0">
                                    <Paperclip className="h-5 w-5 rotate-45" />
                                </Button>
                                {!newMessage.trim() && (
                                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-zinc-500 rounded-full shrink-0">
                                        <Camera className="h-6 w-6" />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="shrink-0">
                        <Button
                            onMouseDown={newMessage.trim() ? undefined : handleMicStart}
                            onTouchStart={newMessage.trim() ? undefined : handleMicStart}
                            onClick={newMessage.trim() ? (e) => handleSendMessage(e) : undefined}
                            disabled={isSending}
                            className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 p-0",
                                newMessage.trim() ? "bg-orange-600 text-white" : "bg-[#128C7E] text-white"
                            )}
                        >
                            {newMessage.trim() ? (
                                isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />
                            ) : (
                                <Mic className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
