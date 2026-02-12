"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Conversation, Message } from "@/types/messaging";
import { Search, Send, MessageSquare, User, MoreVertical, Paperclip, Smile, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const ChatWindow = dynamic(() => import("@/components/chat/ChatWindow").then(mod => mod.ChatWindow), {
    loading: () => <div className="flex-1 flex items-center justify-center bg-zinc-50/30">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>,
    ssr: false
});

interface MessagingClientProps {
    initialConversations: Conversation[];
    currentUser: any;
}

export function MessagingClient({ initialConversations, currentUser }: MessagingClientProps) {
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('id'));
    // MessagingClient now only handles conversation list and selection.
    // Messages and their real-time subscriptions are managed inside ChatWindow.

    // Sync selectedId with URL quest param
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedId(id);
        }
    }, [searchParams]);

    const activeConversation = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-screen md:h-[calc(100vh-140px)] w-full overflow-hidden md:rounded-3xl md:border md:border-zinc-200 bg-white md:shadow-2xl fixed inset-0 md:relative z-50 md:z-auto">
            {/* Sidebar: Conversation List */}
            <div className={cn(
                "w-full md:w-80 lg:w-96 flex flex-col border-r border-zinc-100 bg-white",
                selectedId ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 md:p-6 border-b border-zinc-50 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Messages</h2>
                        <Button variant="ghost" size="icon" className="md:hidden rounded-full h-10 w-10">
                            <MoreVertical className="w-5 h-5 text-zinc-400" />
                        </Button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-orange-500" />
                        <Input
                            placeholder="Rechercher une discussion..."
                            className="pl-10 h-11 rounded-2xl bg-zinc-50 border-none ring-offset-transparent focus-visible:ring-orange-500/20 focus-visible:ring-4 text-sm font-medium transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide py-2 bg-white">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-bold">Aucune discussion</p>
                            <p className="text-xs mt-1">Vos messages s'afficheront ici.</p>
                        </div>
                    ) : (
                        <div className="space-y-0.5 bg-white">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedId(conv.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-4 py-4 transition-all relative group bg-white",
                                        selectedId === conv.id
                                            ? "bg-orange-50/50"
                                            : "hover:bg-zinc-50"
                                    )}
                                >
                                    {selectedId === conv.id && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-orange-500 rounded-r-full" />
                                    )}
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 overflow-hidden shadow-sm border-2 border-white">
                                            {conv.other_party?.avatar_url ? (
                                                <Image
                                                    src={conv.other_party.avatar_url}
                                                    alt={conv.other_party.full_name}
                                                    width={56}
                                                    height={56}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                    <User className="w-7 h-7" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                    </div>

                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-zinc-900 text-[15px] truncate pr-2">
                                                {conv.other_party?.full_name || "Utilisateur"}
                                            </h3>
                                            <span className="text-[11px] font-semibold text-zinc-400 shrink-0">
                                                {format(new Date(conv.last_message_at), 'HH:mm', { locale: fr })}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-orange-600 truncate mb-1">
                                            {conv.ad?.title || "Annonce supprimée"}
                                        </p>
                                        <p className="text-[12px] font-medium text-zinc-400 truncate leading-relaxed">
                                            Cliquez pour voir les messages...
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "flex-1 flex-col bg-zinc-50/30 w-full relative z-20",
                selectedId ? "flex" : "hidden md:flex"
            )}>
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        currentUser={currentUser}
                        onBack={() => setSelectedId(null)}
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
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400 bg-white">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 flex items-center justify-center mb-6 shadow-inner-soft border border-zinc-100">
                            <MessageSquare className="w-10 h-10 opacity-20 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Sélectionnez une discussion</h3>
                        <p className="text-sm font-medium max-w-xs leading-relaxed text-zinc-500">
                            Choisissez une conversation pour commencer à discuter avec vos acheteurs ou vendeurs.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
