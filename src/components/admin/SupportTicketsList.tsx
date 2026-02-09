"use client";

import { useState } from "react";
import {
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Mail,
    Tag,
    ChevronDown,
    Loader2,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Ticket {
    id: string;
    created_at: string;
    subject: string;
    message: string;
    email: string;
    status: "pending" | "in_progress" | "resolved";
    priority: "low" | "medium" | "high";
    category: string;
    user_id?: string;
}

interface SupportTicketsListProps {
    initialTickets: Ticket[];
}

export function SupportTicketsList({ initialTickets }: SupportTicketsListProps) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [actionId, setActionId] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, newStatus: Ticket["status"]) => {
        setActionId(id);
        try {
            const { error } = await supabase
                .from("support_tickets")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
            toast.success(`Statut mis à jour: ${newStatus}`);
        } catch (error: any) {
            toast.error("Erreur lors de la mise à jour.");
        } finally {
            setActionId(null);
        }
    };

    const getStatusBadge = (status: Ticket["status"]) => {
        switch (status) {
            case "pending": return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">En attente</Badge>;
            case "in_progress": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">En cours</Badge>;
            case "resolved": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Résolu</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {tickets.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-[2rem] border border-zinc-800">
                    <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold">Aucun ticket de support pour le moment.</p>
                </div>
            ) : (
                tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 lg:p-8 space-y-6 transition-all hover:border-zinc-700"
                    >
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">#{ticket.id.slice(0, 8)}</span>
                                    {getStatusBadge(ticket.status)}
                                    <Badge variant="outline" className="text-zinc-400 border-zinc-800">{ticket.category}</Badge>
                                </div>
                                <h3 className="text-xl font-black text-zinc-100">{ticket.subject}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                                <Clock className="w-4 h-4" />
                                {format(new Date(ticket.created_at), 'PPPp', { locale: fr })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/50">
                            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                        </div>

                        {/* Footer / Info */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-zinc-800">
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Email</p>
                                        <p className="text-sm font-bold text-zinc-200">{ticket.email}</p>
                                    </div>
                                </div>
                                {ticket.user_id && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <User className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">User ID</p>
                                            <p className="text-sm font-bold text-zinc-200">{ticket.user_id.slice(0, 15)}...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {ticket.status !== "resolved" && (
                                    <>
                                        {ticket.status === "pending" && (
                                            <Button
                                                onClick={() => handleStatusUpdate(ticket.id, "in_progress")}
                                                disabled={actionId === ticket.id}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-4"
                                            >
                                                {actionId === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Marquer en cours"}
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleStatusUpdate(ticket.id, "resolved")}
                                            disabled={actionId === ticket.id}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-4"
                                        >
                                            {actionId === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Résoudre"}
                                        </Button>
                                    </>
                                )}
                                {ticket.status === "resolved" && (
                                    <Button
                                        onClick={() => handleStatusUpdate(ticket.id, "pending")}
                                        disabled={actionId === ticket.id}
                                        variant="outline"
                                        className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 font-bold rounded-xl h-10 px-4"
                                    >
                                        {actionId === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Réouvrir"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
