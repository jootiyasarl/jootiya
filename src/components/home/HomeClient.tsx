"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { SellBanner } from "@/components/home/SellBanner";
import { BlogSection } from "@/components/home/BlogSection";
import { AdCard } from "@/components/AdCard";
import { LocationFilterSidebar } from "@/components/home/LocationFilterSidebar";
import { Package, ArrowRight, WifiOff } from "lucide-react";
import { getCachedAds, saveAds } from "@/lib/pwa/jootiya-db";
import { supabase } from "@/lib/supabaseClient";

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

export default function HomeClient({ initialParams }: { initialParams: any }) {
  const [ads, setAds] = useState<HomepageAd[]>([]);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [loading, setLoading] = useState(true);

  const latParam = typeof initialParams.lat === 'string' ? parseFloat(initialParams.lat) : null;
  const lngParam = typeof initialParams.lng === 'string' ? parseFloat(initialParams.lng) : null;
  const radiusParam = typeof initialParams.radius === 'string' ? parseInt(initialParams.radius) : 50;

  useEffect(() => {
    async function initData() {
      try {
        const cached = await getCachedAds();
        if (cached && cached.length > 0) {
          setAds(cached);
          setIsOfflineData(true);
          setLoading(false);
        }
      } catch (e) {
        console.error("IndexedDB error:", e);
      }

      try {
        let data: any[] | null = [];
        if (latParam && lngParam) {
          const { data: rpcData, error } = await supabase.rpc('get_ads_nearby', {
            user_lat: latParam,
            user_lon: lngParam,
            radius_km: radiusParam,
            limit_count: 50
          });
          if (error) throw error;
          data = rpcData;
        } else {
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
          const formattedAds = data.map((row: any): HomepageAd => {
            const locationParts: string[] = [];
            if (row.neighborhood) locationParts.push(row.neighborhood);
            if (row.city) locationParts.push(row.city);
            const location = locationParts.join(", ") || "Maroc";

            let createdAtLabel: string | undefined;
            if (row.created_at) {
              const d = new Date(row.created_at);
              if (!Number.isNaN(d.getTime())) {
                createdAtLabel = d.toLocaleDateString("fr-FR", { month: 'short', day: 'numeric' }) + " à " + d.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
              }
            }

            const images = row.images || row.image_urls;
            const primaryImageUrl = Array.isArray(images) && images.length > 0 ? (images[0] as string) : undefined;
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

          setAds(formattedAds);
          setIsOfflineData(false);
          setLoading(false);
          
          if (!latParam && !lngParam) {
            saveAds(formattedAds);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    initData();
  }, [latParam, lngParam, radiusParam]);

  const mapAds = ads.filter(a => a.latitude && a.longitude).slice(0, 10);

  return (
    <div dir="ltr" className="min-h-screen bg-white font-sans text-zinc-900 pb-12">
      {isOfflineData && (
        <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest py-1 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" />
          Mode hors-ligne : Affichage des données en cache
        </div>
      )}
      
      <main className="mx-auto max-w-7xl px-4 mt-12 md:mt-26">
        <div className="block mt-16 md:mt-32 mb-6 md:mb-12">
          <SellBanner />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="hidden lg:block lg:col-span-3">
            <Suspense fallback={<div className="h-[400px] w-full bg-zinc-50 animate-pulse rounded-3xl" />}>
              <LocationFilterSidebar ads={mapAds} />
            </Suspense>
          </div>

          <div className="lg:col-span-9 space-y-12 sm:space-y-16">
            {ads.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 rounded-[2.5rem] bg-zinc-50/40">
                <div className="bg-white p-6 rounded-2xl mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
                  <Package className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Aucune annonce trouvée</h3>
                <Link href="/marketplace/post" className="mt-8 inline-flex items-center justify-center px-8 h-12 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-[0_12px_30px_rgba(255,102,0,0.18)] hover:shadow-[0_18px_40px_rgba(255,102,0,0.22)] active:scale-[0.98]">
                  Déposer une annonce
                </Link>
              </div>
            ) : (
              <>
                {latParam ? (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900">Résultats à proximité ({ads.length})</h2>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                      {ads.map((ad, index) => (
                        <AdCard key={ad.id} ad={ad} href={`/ads/${ad.id}`} priority={index < 4} />
                      ))}
                    </div>
                  </section>
                ) : (
                  <>
                    {[
                      { id: 'electronics', label: 'Électronique' },
                      { id: 'vehicles', label: 'Véhicules' },
                      { id: 'fashion', label: 'Mode' },
                      { id: 'tools-equipment', label: 'Outils' }
                    ].map((cat) => {
                      const catAds = ads.filter(ad => ad.categorySlug === cat.id).slice(0, 6);
                      if (catAds.length === 0) return null;
                      return (
                        <section key={cat.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900">{cat.label}</h2>
                            <Link href={`/categories/${cat.id}`} className="text-sm font-bold text-zinc-900 hover:text-orange-500 flex items-center gap-1 group">
                              Voir plus <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                            {catAds.map((ad, index) => (
                              <AdCard key={ad.id} ad={ad} href={`/ads/${ad.id}`} priority={index < 2} />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </>
                )}
                
                <BlogSection />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
