import React, { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { AdCard } from "@/components/AdCard";
import { LocationFilterSidebar } from "@/components/home/LocationFilterSidebar";
import { Package, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type HomepageAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  createdAt?: string;
  sellerBadge?: string;
  isFeatured?: boolean;
  imageUrl?: string;
  categorySlug?: string;
  latitude: number;
  longitude: number;
};

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createSupabaseServerClient();

  const latParam = typeof searchParams.lat === 'string' ? parseFloat(searchParams.lat) : null;
  const lngParam = typeof searchParams.lng === 'string' ? parseFloat(searchParams.lng) : null;
  const radiusParam = typeof searchParams.radius === 'string' ? parseInt(searchParams.radius) : 50;

  let ads: HomepageAd[] = [];
  let fetchError = null;

  try {
    let data: any[] | null = [];

    if (latParam && lngParam) {
      // Geospatial Search (RPC)
      const { data: rpcData, error } = await supabase
        .rpc('get_ads_nearby', {
          user_lat: latParam,
          user_lon: lngParam,
          radius_km: radiusParam,
          limit_count: 50
        });

      if (error) throw error;
      data = rpcData;
    } else {
      // Default Search (Latest)
      const { data: standardData, error } = await supabase
        .from("ads")
        .select("id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status, latitude, longitude")
        .or("status.eq.active,status.eq.approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);

      if (error) throw error;
      data = standardData;
    }

    if (data) {
      ads = data.map((row: any): HomepageAd => {
        const locationParts: string[] = [];
        if (row.neighborhood) locationParts.push(row.neighborhood);
        if (row.city) locationParts.push(row.city);
        // Fallback for location string if needed, though we prioritize structured data
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
          latitude: row.latitude || 0,
          longitude: row.longitude || 0,
        };
      });
    }
  } catch (err: any) {
    console.error("Error fetching ads:", err);
    fetchError = err;
  }

  // Filter ads for the map (must have coordinates)
  const mapAds = ads.filter(a => a.latitude && a.longitude).slice(0, 10);

  return (
    <div dir="ltr" className="min-h-screen bg-white font-sans text-zinc-900 pb-20">
      <CategoryGrid />

      <main className="mx-auto max-w-7xl px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-3">
            <Suspense fallback={<div className="h-[400px] w-full bg-zinc-50 animate-pulse rounded-3xl" />}>
              <LocationFilterSidebar ads={mapAds} />
            </Suspense>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-9 space-y-24 sm:space-y-32">
            {fetchError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                <p>Une erreur s'est produite lors du chargement des annonces. Veuillez réessayer.</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl">
                <div className="bg-zinc-100 p-6 rounded-full mb-4">
                  <Package className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">
                  {latParam ? "Aucune annonce dans cette zone" : "Aucune annonce pour le moment"}
                </h3>
                <p className="text-zinc-500 mt-2 max-w-xs">
                  {latParam ? "Essayez d'augmenter le rayon de recherche." : "Soyez le premier à publier une annonce !"}
                </p>
                <Link href="/marketplace/post" className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
                  Déposer une annonce
                </Link>
              </div>
            ) : (
              <>
                {/* If searching by location, show plain grid. If default view, show categorized sections */}
                {latParam ? (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-zinc-900">
                        Résultats à proximité ({ads.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                      {ads.map((ad) => (
                        <AdCard key={ad.id} ad={ad} href={`/ads/${ad.id}`} />
                      ))}
                    </div>
                  </section>
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
                          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                            {catAds.map((ad) => (
                              <AdCard key={ad.id} ad={ad} href={`/ads/${ad.id}`} />
                            ))}
                          </div>
                        </section>
                      );
                    })}

                    {/* General Section */}
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
                      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                        {ads.slice(0, 12).map((ad) => (
                          <AdCard key={ad.id} ad={ad} href={`/ads/${ad.id}`} />
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
