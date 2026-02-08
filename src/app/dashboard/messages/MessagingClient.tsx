"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Conversation, Message } from "@/types/messaging";
import { ChatWindow } from "@/components/chat/ChatWindow";
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
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', selectedId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data as Message[]);
            }
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
                    <ChatWindow
                        conversation={activeConversation}
                        currentUser={currentUser}
                        onMessageSent={(msg) => {
                            // Update conversation list last_message_at
                            setConversations(prev => prev.map(c =>
                                c.id === activeConversation.id
                                    ? { ...c, last_message_at: msg.created_at }
                                    : c
                            ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));
                        }}
                    />
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
