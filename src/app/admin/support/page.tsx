import { createSupabaseServerClient } from "@/lib/supabase";
import { SupportTicketsList } from "@/components/admin/SupportTicketsList";
import { LifeBuoy } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Support Tickets - Admin",
    robots: { index: false, follow: false },
};

export default async function AdminSupportPage() {
    const supabase = createSupabaseServerClient();

    const { data: tickets, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching tickets:", error);
        return <div className="p-8 text-red-500 font-bold">Erreur de chargement des tickets.</div>;
    }

    const pendingCount = tickets?.filter(t => t.status === "pending").length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        <LifeBuoy className="w-3 h-3" />
                        Administration
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-100">Tickets de Support</h2>
                    <p className="text-zinc-500 font-medium">
                        Gérez les demandes d'assistance des utilisateurs et les problèmes techniques.
                    </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center gap-6">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">En attente</p>
                        <p className="text-3xl font-black text-amber-500">{pendingCount}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800" />
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Total</p>
                        <p className="text-3xl font-black text-zinc-100">{tickets?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <SupportTicketsList initialTickets={tickets as any || []} />
        </div>
    );
}
