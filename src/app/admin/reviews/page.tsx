import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ReviewModerationList } from "@/components/admin/ReviewModerationList";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "Modération des avis | Admin",
    robots: "noindex, nofollow"
};

export default async function AdminReviewsPage() {
    const supabase = createSupabaseServerClient();

    // Fetch pending reviews with buyer and seller info
    const { data: reviews, error } = await supabase
        .from("reviews")
        .select(`
            id,
            rating,
            comment,
            created_at,
            status,
            ad_id,
            ads(title),
            buyer:profiles!buyer_id(full_name, avatar_url),
            seller:profiles!seller_id(full_name, avatar_url)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching pending reviews:", error);
        return <div className="p-8 text-red-500 font-bold">Erreur de chargement.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-orange-500" />
                        Modération des avis
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium">
                        Gérez les commentaires en attente de validation.
                    </p>
                </div>
                <div className="bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">En attente</span>
                    <span className="text-xl font-black text-white">{reviews?.length || 0}</span>
                </div>
            </div>

            <ReviewModerationList initialReviews={reviews as any || []} />
        </div>
    );
}
