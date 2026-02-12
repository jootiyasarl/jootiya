"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Conversation } from "@/types/messaging";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Smile, MoreVertical, CheckCheck, Loader2, ChevronLeft, Mic, Camera, Image as ImageIcon, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { generateSmartReplies } from "@/lib/smartReplies";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import imageCompression from "browser-image-compression";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatAudioRecorder = dynamic(() => import("./ChatAudioRecorder").then(mod => mod.ChatAudioRecorder), {
    loading: () => <div className="h-10 w-10 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-orange-500" /></div>,
    ssr: false
});

const ChatAudioPlayer = dynamic(() => import("./ChatAudioPlayer").then(mod => mod.ChatAudioPlayer), {
    loading: () => <div className="h-8 w-32 bg-zinc-100 animate-pulse rounded-lg" />,
    ssr: false
});

interface ChatWindowProps {
    conversation: Conversation;
    currentUser: any;
    onMessageSent: (message: Message) => void;
    onBack: () => void;
}

const QUICK_REPLIES = [
    "Bonjour, disponible ?",
    "Prix final ?",
    "Localisation ?",
    "Je suis intéressé !"
];

import { ReviewModal } from "./ReviewModal";

export function ChatWindow({ conversation, currentUser, onMessageSent, onBack }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showAudioRecorder, setShowAudioRecorder] = useState(false);
    const [recorderCoords, setRecorderCoords] = useState<{ x: number, y: number } | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasRated, setHasRated] = useState(false);

    const isBuyer = currentUser?.id === conversation.buyer_id;
    const canRate = isBuyer && (conversation.ad?.status === 'active' || conversation.ad?.status === 'sold');

    // Fetch messages & Check if already rated
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

        const checkIfRated = async () => {
            if (!isBuyer || !conversation.ad_id) return;
            const { data } = await supabase
                .from("reviews")
                .select("id")
                .eq("buyer_id", currentUser.id)
                .eq("ad_id", conversation.ad_id)
                .maybeSingle();

            if (data) setHasRated(true);
        };

        fetchMessages();
        checkIfRated();

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
                        const exists = prev.find(m => m.id === newMsg.id);
                        if (exists) return prev;

                        // If we are currently viewing the chat and receive a message, mark it as read
                        if (newMsg.sender_id !== currentUser.id) {
                            supabase.from('messages')
                                .update({ read_at: new Date().toISOString(), is_read: true })
                                .eq('id', newMsg.id)
                                .then();
                        }

                        return [...prev, newMsg];
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversation.id}`,
                },
                (payload) => {
                    const updatedMsg = payload.new as Message;
                    if (updatedMsg.sender_id === currentUser.id) {
                        // Other party read our message
                        setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
                    }
                }
            )
            .subscribe();

        // Mark all existing unread messages from other party as read
        const markAsRead = async () => {
            await supabase
                .from('messages')
                .update({ read_at: new Date().toISOString(), is_read: true })
                .eq('conversation_id', conversation.id)
                .neq('sender_id', currentUser.id)
                .is('read_at', null);
        };
        markAsRead();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversation.id, conversation.ad_id, currentUser.id, isBuyer]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string, fileUrl?: string, typeOverride?: 'text' | 'audio' | 'image' | 'file') => {
        e?.preventDefault();
        const content = contentOverride || newMessage.trim();
        const messageType = typeOverride || (fileUrl ? 'audio' : 'text');

        if (!content && !fileUrl) return;

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            conversation_id: conversation.id,
            sender_id: currentUser.id,
            content: (messageType === 'text') ? content : `Sent a ${messageType}`,
            message_type: messageType,
            file_url: fileUrl || undefined,
            is_read: false,
            created_at: new Date().toISOString(),
            is_optimistic: true // Custom flag for UI
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        if (messageType === 'text') setNewMessage("");

        setIsSending(true);
        const { data, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversation.id,
                sender_id: currentUser.id,
                content: optimisticMsg.content,
                message_type: messageType,
                file_url: fileUrl?.startsWith('blob:') ? null : fileUrl // Don't save blob URLs to DB
            })
            .select()
            .single();

        if (error) {
            console.error("Error sending message:", error);
            toast.error("Erreur lors de l'envoi du message.");
            setMessages((prev) => prev.filter(m => m.id !== tempId));
        } else if (data) {
            // Replace optimistic message with real one
            setMessages((prev) => prev.map(m => m.id === tempId ? data as Message : m));
            setShowAudioRecorder(false);
            onMessageSent(data as Message);

            // Trigger Push Prompt after successful send (Positive Action)
            window.dispatchEvent(new CustomEvent('trigger-push-prompt'));
        }
        setIsSending(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const tempUrl = URL.createObjectURL(file);
        const tempId = `temp-${Date.now()}`;

        // Phase 1: Show Optimistic Preview Immediately
        const optimisticMsg: Message = {
            id: tempId,
            conversation_id: conversation.id,
            sender_id: currentUser.id,
            content: isImage ? "Sent a photo" : "Sent a file",
            message_type: isImage ? 'image' : 'file',
            file_url: tempUrl,
            is_read: false,
            created_at: new Date().toISOString(),
            is_optimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        setIsSending(true);
        try {
            // Phase 2: Professional Compression (if image)
            if (isImage) {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                };
                console.log("Senior Engineer: Compressing image...", file.size / 1024, "KB");
                file = await imageCompression(file, options);
                console.log("Senior Engineer: Compressed size:", file.size / 1024, "KB");
            }

            const fileExt = file.name.split('.').pop() || (isImage ? 'webp' : 'bin');
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `chat-attachments/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            // Phase 3: Update DB and confirm message
            const { data, error } = await supabase
                .from("messages")
                .insert({
                    conversation_id: conversation.id,
                    sender_id: currentUser.id,
                    content: optimisticMsg.content,
                    message_type: optimisticMsg.message_type,
                    file_url: publicUrl
                })
                .select()
                .single();

            if (data) {
                setMessages((prev) => prev.map(m => m.id === tempId ? data as Message : m));
                onMessageSent(data as Message);

                // Trigger Push Prompt after successful file upload (Positive Action)
                window.dispatchEvent(new CustomEvent('trigger-push-prompt'));
            } else if (error) {
                // Zero Waste: If DB insert failed, delete the uploaded file
                if (publicUrl) {
                    console.warn("Senior/ZeroWaste: DB Error, deleting orphan file from storage...");
                    const { deleteFileByUrl } = await import("@/lib/storageUtils");
                    deleteFileByUrl(publicUrl);
                }
                throw error;
            }
        } catch (error: any) {
            toast.error(`Erreur d'envoi: ${error.message}`);
            setMessages((prev) => prev.filter(m => m.id !== tempId));
        } finally {
            setIsSending(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
            // Cleanup temp URL
            if (tempUrl) URL.revokeObjectURL(tempUrl);
        }
    };

    const handleMicStart = (e: React.MouseEvent | React.TouchEvent) => {
        const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setRecorderCoords({ x, y });
        setShowAudioRecorder(true);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#F4F4F9] dark:bg-zinc-950 relative">
            {/* Header: Pro Frosted Design */}
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 p-3 flex items-center justify-between z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2 text-zinc-500 h-10 w-10 rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Avatar className="h-10 w-10 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <AvatarImage src={conversation.other_party?.avatar_url || ""} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                            {conversation.other_party?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight text-[15px]">
                            {conversation.other_party?.full_name || "Utilisateur"}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-zinc-900 shadow-sm" />
                            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">En ligne</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {canRate && !hasRated && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReviewModal(true)}
                            className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-full"
                        >
                            <Star className="w-4 h-4 fill-current" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-zinc-400 rounded-full h-10 w-10">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Review Modal */}
            {conversation.ad_id && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    sellerId={conversation.seller_id}
                    adId={conversation.ad_id}
                    buyerId={currentUser.id}
                    onSuccess={() => setHasRated(true)}
                />
            )}

            {/* Messages List: Native Scrolling Area */}
            <ScrollArea className="flex-1 px-4 py-6 md:px-8">
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
                                    <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%] transition-all duration-500 animate-in fade-in slide-in-from-bottom-2", isMe ? "items-end" : "items-start")}>
                                <div className={cn(
                                    "px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-[16px] leading-relaxed break-words relative",
                                    isMe
                                        ? "bg-orange-500 text-white rounded-[1.2rem] rounded-tr-[0.2rem] shadow-sm"
                                        : "bg-[#E9E9EB] dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-[1.2rem] rounded-tl-[0.2rem]"
                                )}>
                                            {msg.message_type === 'audio' && (
                                                <ChatAudioPlayer url={msg.file_url || ""} isMe={isMe} />
                                            )}
                                            {msg.message_type === 'image' && msg.file_url && (
                                                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden my-1 border border-white/20 bg-zinc-100">
                                                    <Image
                                                        src={msg.file_url}
                                                        alt="Image"
                                                        fill
                                                        className={cn("object-cover transition-opacity duration-300", msg.is_optimistic ? "opacity-50 blur-sm" : "opacity-100")}
                                                        unoptimized={msg.file_url.startsWith('blob:')} // For immediate display of optimistic/new images
                                                        priority={i === messages.length - 1} // Priority for the very last message
                                                    />
                                                    {msg.is_optimistic && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/10">
                                                            <Loader2 className="h-6 w-6 animate-spin text-white drop-shadow-md" />
                                                            <span className="text-[10px] text-white font-bold drop-shadow-md uppercase tracking-wider">Compression et envoi...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {msg.message_type === 'file' && msg.file_url && (
                                                <Link
                                                    href={msg.file_url}
                                                    target="_blank"
                                                    className={cn(
                                                        "flex items-center gap-2 p-2 rounded-lg border",
                                                        isMe ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                                                    )}
                                                >
                                                    <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center shrink-0">
                                                        <Paperclip className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[10px] font-bold uppercase opacity-60">Fichier</span>
                                                        <span className="text-xs truncate max-w-[120px]">
                                                            {msg.file_url.split('/').pop()}
                                                        </span>
                                                    </div>
                                                </Link>
                                            )}
                                            {msg.message_type === 'text' && (
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
                                                    <CheckCheck className={cn(
                                                        "h-3 w-3 transition-colors",
                                                        msg.read_at ? "text-blue-400" : "text-zinc-300"
                                                    )} />
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

            {/* Input Area: Native App Style */}
            <div className="p-2 md:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 z-50 sticky bottom-0 pb-safe shadow-sm">
                <input
                    type="file"
                    id="chat-file-input"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
                <input
                    type="file"
                    id="chat-camera-input"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    ref={cameraInputRef}
                    onChange={handleFileSelect}
                />
                <div className="flex items-end gap-2 max-w-full">
                    <div className="flex-1 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 rounded-[28px] border border-zinc-100 dark:border-zinc-700 min-h-[44px] px-1 relative">
                        {showAudioRecorder ? (
                            <ChatAudioRecorder
                                onSend={(url) => handleSendMessage(undefined, undefined, url, 'audio')}
                                onCancel={() => setShowAudioRecorder(false)}
                                initialX={recorderCoords?.x}
                                initialY={recorderCoords?.y}
                            />
                        ) : (
                            <>
                                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-zinc-400 hover:text-orange-500 rounded-full shrink-0 transition-colors">
                                    <Smile className="h-6 w-6" />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 py-3 font-medium text-[16px] placeholder:text-zinc-400 min-w-0 h-auto"
                                />
                                <label
                                    htmlFor="chat-file-input"
                                    className="h-10 w-10 text-zinc-400 rounded-full shrink-0 flex items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <Paperclip className="h-5 w-5 rotate-45" />
                                </label>

                                {!newMessage.trim() && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="h-10 w-10 text-zinc-400 rounded-full shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                    >
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
                                "h-11 w-11 rounded-full flex items-center justify-center transition-all active:scale-90 p-0 shadow-sm",
                                newMessage.trim() ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            )}
                        >
                            {newMessage.trim() ? (
                                isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />
                            ) : (
                                <Mic className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
