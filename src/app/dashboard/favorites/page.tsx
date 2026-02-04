import { createSupabaseServerClient, getServerUser } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { AdCard } from "@/components/AdCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function FavoritesPage() {
    const user = await getServerUser();

    if (!user) {
        redirect("/login?redirectTo=/dashboard/favorites");
    }

    const supabase = createSupabaseServerClient();

    // Fetch favorites joining with ads and profiles
    const { data: favorites, error } = await supabase
        .from("favorites")
        .select(`
      ad_id,
      ads (
        *,
        profiles (
            full_name,
            username,
            avatar_url
        )
      )
    `)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching favorites:", error);
    }

    const ads = favorites?.map((f: any) => f.ads).filter(Boolean) || [];

    const mappedAds = ads.map((ad: any) => {
        // Handle profile being single object or array depending on query result
        const profile = Array.isArray(ad.profiles) ? ad.profiles[0] : ad.profiles;
        return {
            id: ad.id,
            title: ad.title,
            price: `${ad.price}`, // AdCard might expect string with currency or just value, assuming string based on previous usage
            location: ad.city || "Maroc",
            imageUrl: ad.image_urls?.[0] || null,
            status: ad.status,
            createdAt: ad.created_at,
            isFeatured: ad.is_featured,
            sellerName: profile?.full_name || profile?.username || 'Vendeur Jootiya',
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    Favoris
                </h1>
                <p className="text-zinc-500 dark:text-gray-400 mt-1">
                    Retrouvez vos annonces sauvegardées
                </p>
            </div>

            {mappedAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-zinc-200 rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 dark:bg-red-900/20">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Aucun favori pour le moment</h3>
                    <p className="text-zinc-500 mt-2 max-w-sm text-center dark:text-zinc-400">
                        Parcourez le marché et cliquez sur le cœur pour sauvegarder les annonces qui vous intéressent.
                    </p>
                    <Link href="/marketplace" className="mt-6">
                        <Button>Explorer le marché</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mappedAds.map((ad: any) => (
                        <AdCard key={ad.id} ad={ad} />
                    ))}
                </div>
            )}
        </div>
    );
}
