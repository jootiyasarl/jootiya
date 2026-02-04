"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Conversation, Message, getMessages } from "@/lib/db/messaging";
import { Search, Send, MessageSquare, User, MoreVertical, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessagingClientProps {
    initialConversations: Conversation[];
    currentUser: any;
}

export function MessagingClient({ initialConversations, currentUser }: MessagingClientProps) {
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('id'));
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync selectedId with URL quest param
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedId(id);
        }
    }, [searchParams]);

    const activeConversation = conversations.find(c => c.id === selectedId);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch messages when selected conversation changes
    useEffect(() => {
        if (!selectedId) return;

        async function loadMessages() {
            setIsLoadingMessages(true);
            const data = await getMessages(selectedId!);
            setMessages(data);
            setIsLoadingMessages(false);
        }

        loadMessages();

        // Subscribe to new messages for this conversation
        const channel = supabase
            .channel(`room:${selectedId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${selectedId}`
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages(prev => [...prev, newMessage]);

                    // Update conversation last_message_at in list
                    setConversations(prev => prev.map(c =>
                        c.id === selectedId
                            ? { ...c, last_message_at: newMessage.created_at }
                            : c
                    ));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedId) return;

        const content = newMessage.trim();
        setNewMessage("");

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: selectedId,
                sender_id: currentUser.id,
                content: content
            });

        if (error) {
            console.error("Error sending message:", error);
            alert("Erreur lors de l'envoi du message");
        }
    };

    return (
        <div className="flex h-full w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
            {/* Sidebar: Conversation List */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-zinc-100">
                <div className="p-6 border-b border-zinc-100">
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Rechercher une discussion..."
                            className="pl-10 h-11 rounded-xl bg-zinc-50 border-none ring-offset-transparent focus-visible:ring-blue-600 focus-visible:ring-1"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-bold">Aucune conversation pour le moment.</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedId(conv.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 transition-all border-l-4 hover:bg-zinc-50 outline-none",
                                    selectedId === conv.id
                                        ? "bg-blue-50/50 border-blue-600"
                                        : "border-transparent"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shadow-sm">
                                        {conv.other_party?.avatar_url ? (
                                            <Image
                                                src={conv.other_party.avatar_url}
                                                alt={conv.other_party.full_name}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                </div>

                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-black text-zinc-900 text-sm uppercase truncate pr-2">
                                            {conv.other_party?.full_name || "Utilisateur"}
                                        </h3>
                                        <span className="text-[10px] font-bold text-zinc-400 shrink-0">
                                            {format(new Date(conv.last_message_at), 'HH:mm', { locale: fr })}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-blue-600 truncate mb-1">
                                        {conv.ad?.title || "Annonce supprimée"}
                                    </p>
                                    <p className="text-[11px] font-medium text-zinc-400 truncate">
                                        Cliquez pour voir les messages...
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="hidden md:flex flex-1 flex-col bg-zinc-50/30">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-zinc-100 flex items-center justify-between shadow-sm relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 overflow-hidden shadow-sm">
                                    {activeConversation.other_party?.avatar_url ? (
                                        <Image
                                            src={activeConversation.other_party.avatar_url}
                                            alt={activeConversation.other_party.full_name}
                                            width={40}
                                            height={40}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-zinc-900 text-sm uppercase leading-tight">
                                        {activeConversation.other_party?.full_name || "Utilisateur"}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">En ligne</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/ads/${activeConversation.ad_id}`}
                                    className="hidden lg:flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100 group transition-all hover:bg-zinc-100"
                                >
                                    <div className="w-6 h-6 rounded bg-white overflow-hidden border border-zinc-100 relative shadow-sm">
                                        {activeConversation.ad?.image_urls?.[0] && (
                                            <Image
                                                src={activeConversation.ad.image_urls[0]}
                                                alt={activeConversation.ad.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <span className="text-[11px] font-bold text-zinc-600 truncate max-w-[150px]">
                                        {activeConversation.ad?.title}
                                    </span>
                                </Link>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-zinc-400 transition-all hover:bg-zinc-50 hover:text-zinc-900">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {isLoadingMessages ? (
                                <div className="flex items-center justify-center h-full text-zinc-400 animate-pulse text-sm font-bold">
                                    Chargement des messages...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400 opacity-50">
                                    <MessageSquare className="w-8 h-8 mb-2" />
                                    <p className="text-xs font-bold">Dites bonjour ! Commencez la discussion.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUser.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                                        >
                                            <div className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all",
                                                isMe
                                                    ? "bg-zinc-900 text-white rounded-tr-none"
                                                    : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                                            )}>
                                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-400 mt-1.5 px-1 uppercase tracking-wider">
                                                {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-zinc-100">
                            <form
                                onSubmit={handleSendMessage}
                                className="relative flex items-center gap-2"
                            >
                                <div className="flex-1 relative">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Votre message..."
                                        className="h-12 pl-4 pr-24 rounded-2xl bg-zinc-50 border-none ring-offset-transparent focus-visible:ring-blue-600 focus-visible:ring-1 font-medium"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-transparent">
                                            <Smile className="w-5 h-5" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-transparent">
                                            <Paperclip className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-12 w-12 rounded-2xl bg-blue-600 shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all p-0 disabled:opacity-50 disabled:scale-100"
                                >
                                    <Send className="w-5 h-5 fill-white" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400">
                        <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center mb-6 shadow-sm">
                            <MessageSquare className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2">Sélectionnez une discussion</h3>
                        <p className="text-sm font-bold max-w-xs leading-relaxed">
                            Choisissez une conversation à gauche pour commencer à discuter avec vos acheteurs ou vendeurs.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
