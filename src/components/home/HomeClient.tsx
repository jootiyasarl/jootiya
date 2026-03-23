"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { SellBanner } from "@/components/home/SellBanner";
import { BlogSection } from "@/components/home/BlogSection";
import { AdCard } from "@/components/AdCard";
import { Package, ArrowRight, WifiOff } from "lucide-react";
import { getCachedAds, saveAds } from "@/lib/pwa/jootiya-db";
import { supabase } from "@/lib/supabaseClient";
import { LocationPrompt } from "@/components/LocationPrompt";
import { fetchNearbyAds } from "@/lib/nearbyAds";
import useEmblaCarousel from "embla-carousel-react";

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
  distanceKm?: number;
  sellerName?: string;
  sellerAvatar?: string;
};

export default function HomeClient({ initialParams }: { initialParams: any }) {
  const [ads, setAds] = useState<HomepageAd[]>([]);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const latParam = typeof initialParams.lat === 'string' ? parseFloat(initialParams.lat) : null;
  const lngParam = typeof initialParams.lng === 'string' ? parseFloat(initialParams.lng) : null;
  const radiusParam = typeof initialParams.radius === 'string' ? parseInt(initialParams.radius) : 50;

  useEffect(() => {
    let isMounted = true;
    
    async function initData() {
      if (!isMounted) return;
      
      try {
        console.log("Starting data fetch...");
        if (typeof window !== "undefined") {
          const cached = await getCachedAds();
          if (cached && cached.length > 0 && isMounted) {
            console.log("Loaded from cache:", cached.length);
            setAds(cached);
            setIsOfflineData(true);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("IndexedDB error:", e);
      }

      try {
        let data: any[] | null = [];
        let storedLocation = null;
        
        if (typeof window !== "undefined") {
          try {
            const storedLocationStr = localStorage.getItem("user_location");
            storedLocation = storedLocationStr ? JSON.parse(storedLocationStr) : null;
          } catch (e) {
            console.error("LocalStorage error:", e);
          }
        }

        const lat = latParam || storedLocation?.lat;
        const lon = lngParam || storedLocation?.lon;

        let resultData: any[] | null = null;
        if (lat && lon) {
          console.log("Fetching nearby ads...");
          resultData = await fetchNearbyAds({
            latitude: lat,
            longitude: lon,
            radiusKm: radiusParam,
            limit: 60,
          });
        } else {
          console.log("Fetching standard ads...");
          const { data: standardData, error: fetchError } = await supabase
            .from("ads")
            .select(`
              id, 
              title, 
              price, 
              currency, 
              city, 
              neighborhood, 
              created_at, 
              is_featured, 
              image_urls, 
              category, 
              status, 
              latitude, 
              longitude, 
              seller_id
            `)
            .or("status.eq.active,status.eq.approved")
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(60);
          if (fetchError) throw fetchError;
          resultData = standardData;
        }

        if (resultData && isMounted) {
          console.log("Data fetched successfully:", resultData.length);
          const formattedAds = resultData.map((row: any): HomepageAd => {
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

            // Get seller name/avatar (safely)
            const profile = (row as any)?.profiles;
            const profileObj = Array.isArray(profile) ? profile[0] : profile;

            const sellerName =
              (typeof (row as any)?.sellerName === 'string' ? (row as any).sellerName : undefined) ||
              (typeof (row as any)?.seller_name === 'string' ? (row as any).seller_name : undefined) ||
              profileObj?.full_name ||
              profileObj?.username ||
              "Utilisateur";

            const sellerAvatar =
              (typeof (row as any)?.sellerAvatar === 'string' ? (row as any).sellerAvatar : undefined) ||
              (typeof (row as any)?.seller_avatar === 'string' ? (row as any).seller_avatar : undefined) ||
              profileObj?.avatar_url;

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
              distanceKm: row.distanceKm,
              sellerName: sellerName,
              sellerAvatar: sellerAvatar,
            };
          });

          setAds(formattedAds);
          setIsOfflineData(false);
          setLoading(false);
          
          if (!latParam && !lngParam) {
            saveAds(formattedAds);
          }
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Erreur de chargement");
        setLoading(false);
      }
    }

    initData();
    return () => { isMounted = false; };
  }, [latParam, lngParam, radiusParam]);

  const mapAds = ads.filter(a => a.latitude && a.longitude).slice(0, 10);

  const categoryMapping: { [key: string]: string } = {
    "electronics": "electronics",
    "home-furniture": "home-furniture",
    "vehicles": "vehicles",
    "fashion": "fashion",
    "tools-equipment": "tools-equipment",
    "hobbies": "hobbies",
    "animals": "animals",
    "books": "books",
    "used-clearance": "used-clearance",
    "other": "other",
    "Électronique": "electronics",
    "Maison & Ameublement": "home-furniture",
    "Véhicules & Transport": "vehicles",
    "Mode & Chaussures": "fashion",
    "Outils & Équipement": "tools-equipment",
    "Loisirs & Diverتissement": "hobbies",
    "Animaux": "animals",
    "Livres & Études": "books",
    "Occasions / Vide-grenier": "used-clearance",
    "Autres": "other"
  };

  const getCategorySlug = (categoryName: string) => {
    return categoryMapping[categoryName] || "other";
  };

  const groupedAds = ads.reduce((acc: any, ad) => {
    const category = ad.categorySlug || "Autre";
    if (!acc[category]) acc[category] = [];
    acc[category].push(ad);
    return acc;
  }, {});

  const orderedCategories = Object.keys(groupedAds).sort((a, b) => {
    const preferredOrder = ["electronics", "Électronique", "electronique", "electronics"];
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b, "fr", { sensitivity: "base" });
  });

  const toAdCard = (ad: HomepageAd) => ({
    id: ad.id,
    title: ad.title,
    price: ad.price,
    location: ad.location,
    createdAt: ad.createdAt,
    sellerBadge: ad.sellerBadge,
    isFeatured: ad.isFeatured,
    imageUrl: ad.imageUrl,
  });

  function CategoryCarousel({ items }: { items: HomepageAd[] }) {
    const slides = items.slice(0, 10);
    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: false,
      align: "start",
      containScroll: "trimSnaps",
    });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3 pb-4">
            {slides.map((ad) => (
              <div
                key={ad.id}
                className="flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_24%] min-w-0"
              >
                <AdCard ad={toAdCard(ad) as any} href={`/ads/${ad.id}`} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={scrollPrev}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm items-center justify-center text-zinc-800 hover:text-orange-600 transition-colors"
          aria-label="Précédent"
        >
          <span className="text-lg font-black">‹</span>
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm items-center justify-center text-zinc-800 hover:text-orange-600 transition-colors"
          aria-label="Suivant"
        >
          <span className="text-lg font-black">›</span>
        </button>
      </div>
    );
  }

  return (
    <div dir="ltr" className="min-h-screen bg-white font-sans text-zinc-900 pb-12">
      <LocationPrompt />
      {isOfflineData && (
        <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest py-1 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" />
          Mode hors-ligne : Affichage des données en cache
        </div>
      )}
      
      <main className="main-content-wrapper container-standard py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex flex-col items-center gap-3">
            <p>Impossible de charger les annonces : {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs"
            >
              Réessayer
            </button>
          </div>
        )}
        <div className="block mb-6 md:mb-10">
          <SellBanner />
        </div>
        
        <div className="space-y-12 sm:space-y-16 min-w-0">
          {ads.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 rounded-[2.5rem] bg-zinc-50/40 px-4">
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
              {loading ? (
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 px-1 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex-[0_0_72%] md:flex-none aspect-[3/4] bg-zinc-100 animate-pulse rounded-[2rem] shrink-0" />
                  ))}
                </div>
              ) : (
                <>
                  {orderedCategories.map((category) => {
                    const categoryAds = groupedAds[category];
                    if (categoryAds.length === 0) return null;

                    return (
                      <section key={category} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em]">{category}</span>
                            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                              {category}
                            </h2>
                          </div>
                          <Link 
                            href={`/categories/${getCategorySlug(category)}`}
                            className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-orange-600 transition-all duration-300"
                          >
                            Voir tout
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </Link>
                        </div>

                        <CategoryCarousel items={categoryAds} />
                      </section>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
