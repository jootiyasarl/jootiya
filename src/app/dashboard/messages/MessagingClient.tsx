"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Conversation, Message } from "@/types/messaging";
import { Search, Send, MessageSquare, User, MoreVertical, Paperclip, Smile, Loader2, X } from "lucide-react";
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
        <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-zinc-950 md:relative md:inset-auto md:z-auto md:h-[calc(100vh-140px)] md:rounded-3xl md:border md:border-zinc-200 md:shadow-2xl overflow-hidden">
            {/* Sidebar: Conversation List */}
            <div className={cn(
                "flex flex-col h-full bg-white dark:bg-zinc-950",
                "w-full md:w-80 lg:w-96 md:border-r md:border-zinc-100",
                selectedId ? "hidden md:flex" : "flex"
            )}>
                <div className="px-4 py-5 md:p-6 border-b border-zinc-50 dark:border-zinc-900 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="md:hidden p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                                <X className="w-6 h-6" />
                            </Link>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Messages</h2>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-zinc-400">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-orange-500" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-10 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none ring-offset-transparent focus-visible:ring-orange-500/20 focus-visible:ring-4 text-sm font-medium transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-bold">Aucune discussion</p>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedId(conv.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-4 py-3.5 transition-all relative group",
                                        selectedId === conv.id
                                            ? "bg-orange-50/50 dark:bg-orange-500/5"
                                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-sm border-2 border-white dark:border-zinc-950">
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
                                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full shadow-sm" />
                                    </div>

                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] truncate">
                                                {conv.other_party?.full_name || "Utilisateur"}
                                            </h3>
                                            <span className="text-[11px] font-medium text-zinc-400 shrink-0">
                                                {format(new Date(conv.last_message_at), 'HH:mm', { locale: fr })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[11px] font-bold text-orange-600 dark:text-orange-500 truncate uppercase tracking-wide">
                                                {conv.ad?.title || "Annonce supprimée"}
                                            </p>
                                            <p className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500 truncate">
                                                Appuyez pour voir les messages...
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "flex-1 flex-col h-full bg-zinc-50/30 dark:bg-zinc-950/30 w-full relative",
                selectedId ? "flex" : "hidden md:flex"
            )}>
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        currentUser={currentUser}
                        onBack={() => setSelectedId(null)}
                        onMessageSent={(msg) => {
                            setConversations(prev => prev.map(c =>
                                c.id === activeConversation.id
                                    ? { ...c, last_message_at: msg.created_at }
                                    : c
                            ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400 bg-white dark:bg-zinc-950">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                            <MessageSquare className="w-10 h-10 text-orange-500 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Sélectionnez une discussion</h3>
                        <p className="text-sm font-medium max-w-xs text-zinc-500 dark:text-zinc-400">
                            Choisissez une conversation pour commencer à discuter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
