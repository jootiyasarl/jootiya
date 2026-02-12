import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
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
        id,
        slug,
        title,
        price,
        currency,
        city,
        neighborhood,
        image_urls,
        status,
        created_at,
        is_featured,
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
        const profile = Array.isArray(ad.profiles) ? ad.profiles[0] : ad.profiles;
        return {
            id: ad.id,
            slug: ad.slug,
            title: ad.title,
            price: ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : 'Sur demande',
            location: ad.neighborhood ? `${ad.neighborhood}, ${ad.city}` : ad.city || "Maroc",
            imageUrl: ad.image_urls?.[0] || null,
            status: ad.status,
            createdAt: ad.created_at ? `${new Date(ad.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })} à ${new Date(ad.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}` : 'Aujourd\'hui',
            isFeatured: ad.is_featured,
            sellerName: profile?.full_name || profile?.username || 'Vendeur Jootiya',
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    Mes Favoris
                </h1>
                <p className="text-zinc-500 dark:text-gray-400 mt-1">
                    Retrouvez ici toutes les annonces que vous avez sauvegardées.
                </p>
            </div>

            {mappedAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-zinc-200 rounded-3xl dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 dark:bg-red-900/20">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Aucun favori pour le moment</h3>
                    <p className="text-zinc-500 mt-2 max-w-sm text-center dark:text-zinc-400">
                        Parcourez le marché et cliquez sur le cœur pour sauvegarder les annonces qui vous intéressent.
                    </p>
                    <Link href="/marketplace" className="mt-6">
                        <Button className="rounded-xl px-8 h-12 font-bold transition-all hover:scale-105">Explorer le marché</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {mappedAds.map((ad: any) => (
                        <AdCard key={ad.id} ad={ad} />
                    ))}
                </div>
            )}
        </div>
    );
}
