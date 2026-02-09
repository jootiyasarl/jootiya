import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { AdCard } from "@/components/AdCard";
import { Package, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type HomepageAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  distance?: string;
  createdAt?: string;
  sellerBadge?: string;
  isFeatured?: boolean;
  imageUrl?: string;
  categorySlug?: string;
  categoryName?: string;
};

export default async function Home() {
  const supabase = createSupabaseServerClient();

  // Fetch all active ads
  const { data: adsData, error: adsError } = await supabase
    .from("ads")
    .select("id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status")
    // .eq("status", "active") // Using OR condition directly if needed, but best to filter by active
    .or("status.eq.active,status.eq.approved")
    .order("is_featured", { ascending: false }) // Featured first
    .order("created_at", { ascending: false })
    .limit(60);

  let ads: HomepageAd[] = [];
  let fetchError = adsError;

  try {
    if (!adsError && Array.isArray(adsData)) {
      ads = adsData.map((row: any): HomepageAd => {
        const locationParts: string[] = [];
        if (row.neighborhood) locationParts.push(row.neighborhood);
        if (row.city) locationParts.push(row.city);
        if (locationParts.length === 0 && row.location) locationParts.push(row.location);

        const location = locationParts.join(", ") || "Maroc";

        let createdAtLabel: string | undefined;
        if (row.created_at) {
          const d = new Date(row.created_at);
          if (!Number.isNaN(d.getTime())) {
            createdAtLabel = d.toLocaleDateString("fr-FR", { month: 'short', day: 'numeric' });
          }
        }

        const images = row.images || row.image_urls;
        const primaryImageUrl =
          Array.isArray(images) && images.length > 0
            ? (images[0] as string)
            : undefined;

        const currency = typeof row.currency === 'string' ? row.currency.trim() : "MAD";
        const priceLabel = row.price != null ? `${row.price} ${currency || "MAD"}` : "—";

        return {
          id: row.id,
          title: row.title,
          price: priceLabel,
          location,
          createdAt: createdAtLabel,
          sellerBadge: row.is_featured ? "À la une" : undefined,
          isFeatured: Boolean(row.is_featured),
          imageUrl: primaryImageUrl,
          categorySlug: row.category,
        };
      });
    }
  } catch (err: any) {
    console.error("Critical error mapping ads:", err);
    fetchError = err;
  }

  return (
    <div dir="ltr" className="min-h-screen bg-white font-sans text-zinc-900 pb-20">


      <CategoryGrid />

      <main className="mx-auto max-w-7xl px-4 space-y-24 sm:space-y-32">

        {fetchError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p>Une erreur s'est produite lors du chargement des annonces.</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl">
            <div className="bg-zinc-100 p-6 rounded-full mb-4">
              <Package className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Aucune annonce pour le moment</h3>
            <p className="text-zinc-500 mt-2 max-w-xs">Soyez le premier à publier une annonce sur notre nouvelle plateforme !</p>
            <Link href="/marketplace/post" className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
              Déposer une annonce
            </Link>
          </div>
        ) : (
          <>
            {/* Categorized Sections */}
            {[
              { id: 'electronics', label: 'Électronique' },
              { id: 'vehicles', label: 'Véhicules' },
              { id: 'real-estate', label: 'Immobilier' }
            ].map((cat) => {
              const catAds = ads.filter(ad => ad.categorySlug === cat.id).slice(0, 6);
              if (catAds.length === 0) return null;

              return (
                <section key={cat.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-zinc-900">{cat.label}</h2>
                    <Link
                      href={`/marketplace?category=${cat.id}`}
                      className="text-sm font-bold text-zinc-900 hover:text-orange-500 flex items-center gap-1 group"
                    >
                      Voir plus d'annonces
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {catAds.map((ad) => (
                      <AdCard key={ad.id} ad={ad} href={`/ads/${ad.id}`} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* General Section for everything else */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900">Toutes les annonces</h2>
                <Link
                  href="/marketplace"
                  className="text-sm font-bold text-zinc-900 hover:text-orange-500 flex items-center gap-1 group"
                >
                  Tout parcourir
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {ads.slice(0, 12).map((ad) => (
                  <AdCard key={ad.id} ad={ad} href={`/ads/${ad.id}`} />
                ))}
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
}
