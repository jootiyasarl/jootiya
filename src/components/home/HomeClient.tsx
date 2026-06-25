"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SellBanner } from "@/components/home/SellBanner";
import { TrustSection } from "@/components/home/TrustSection";
import { AdCard, type PublicAdCardAd } from "@/components/AdCard";
import { Package, ArrowRight, WifiOff, ChevronLeft, ChevronRight, PlusCircle, Clock3, MapPin, Sparkles } from "lucide-react";
import { getCachedAds, saveAds } from "@/lib/pwa/jootiya-db";
import { supabase } from "@/lib/supabaseClient";
import { fetchNearbyAds } from "@/lib/nearbyAds";
import useEmblaCarousel from "embla-carousel-react";

const CATEGORY_LABELS: { [key: string]: string } = {
  "electronics": "Électronique",
  "home-furniture": "Maison & Ameublement",
  "vehicles": "Véhicules & Transport",
  "fashion": "Mode & Chaussures",
  "tools-equipment": "Outils & Équipement",
  "hobbies": "Loisirs & Divertissement",
  "animals": "Animaux",
  "books": "Livres & Études",
  "used-clearance": "Occasions",
  "other": "Autres",
};

export type HomepageAd = {
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

type HomeInitialParams = {
  lat?: string;
  lng?: string;
  radius?: string;
};

export type HomepageAdRow = {
  id: string;
  title: string;
  price: number | string | null;
  currency?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  created_at?: string | null;
  is_featured?: boolean | null;
  images?: string[] | null;
  image_urls?: string[] | null;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number;
  dist_meters?: number;
  profiles?: {
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | Array<{
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  }>;
  sellerName?: string;
  seller_name?: string;
  sellerAvatar?: string;
  seller_avatar?: string;
};

function mapHomepageAdRow(row: HomepageAdRow): HomepageAd {
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

  const profile = row.profiles;
  const profileObj = Array.isArray(profile) ? profile[0] : profile;

  const sellerName =
    (typeof row.sellerName === 'string' ? row.sellerName : undefined) ||
    (typeof row.seller_name === 'string' ? row.seller_name : undefined) ||
    profileObj?.full_name ||
    profileObj?.username ||
    "Utilisateur";

  const sellerAvatar =
    (typeof row.sellerAvatar === 'string' ? row.sellerAvatar : undefined) ||
    (typeof row.seller_avatar === 'string' ? row.seller_avatar : undefined) ||
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
    categorySlug: row.category || undefined,
    latitude: row.latitude || 0,
    longitude: row.longitude || 0,
    distanceKm: row.distanceKm ?? (row.dist_meters != null ? row.dist_meters / 1000 : undefined),
    sellerName,
    sellerAvatar: sellerAvatar || undefined,
  };
}

export default function HomeClient({ initialParams, initialAds }: { initialParams: HomeInitialParams; initialAds?: HomepageAdRow[] }) {
  const [ads, setAds] = useState<HomepageAd[]>(() => (initialAds || []).map(mapHomepageAdRow));
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [loading, setLoading] = useState(!initialAds?.length);
  const [error, setError] = useState<string | null>(null);

  const latParam = typeof initialParams.lat === 'string' ? parseFloat(initialParams.lat) : null;
  const lngParam = typeof initialParams.lng === 'string' ? parseFloat(initialParams.lng) : null;
  const radiusParam = typeof initialParams.radius === 'string' ? parseInt(initialParams.radius) : 50;

  useEffect(() => {
    let isMounted = true;

    // If the server already provided fresh ads, avoid the stale cache + refetch dance
    if (initialAds?.length) {
      if (isMounted) {
        setLoading(false);
        setIsOfflineData(false);
      }
      return;
    }

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

        let resultData: HomepageAdRow[] | null = null;
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
            .or("status.eq.active,status.eq.approved,status.eq.pending")
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(60);
          if (fetchError) throw fetchError;
          resultData = standardData;
        }

        if (resultData && isMounted) {
          console.log("Data fetched successfully:", resultData.length);
          const formattedAds = resultData.map(mapHomepageAdRow);

          setAds(formattedAds);
          setIsOfflineData(false);
          setLoading(false);
          
          if (!latParam && !lngParam) {
            saveAds(formattedAds);
          }
        }
      } catch (err: unknown) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Erreur de chargement");
        setLoading(false);
      }
    }

    initData();
    return () => { isMounted = false; };
  }, [latParam, lngParam, radiusParam, initialAds]);

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

  const groupedAds = ads.reduce<Record<string, HomepageAd[]>>((acc, ad) => {
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

  const toAdCard = (ad: HomepageAd): PublicAdCardAd => ({
    id: ad.id,
    title: ad.title,
    price: ad.price,
    location: ad.location,
    createdAt: ad.createdAt,
    sellerBadge: ad.sellerBadge,
    isFeatured: ad.isFeatured,
    imageUrl: ad.imageUrl,
  });

  const latestAds = ads.slice(0, 12);
  const nearbyAds = ads
    .filter((ad) => typeof ad.distanceKm === "number" && Number.isFinite(ad.distanceKm))
    .sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 12);

  function SectionHeader({
    eyebrow,
    title,
    href,
    icon: Icon,
  }: {
    eyebrow: string;
    title: string;
    href?: string;
    icon?: React.ElementType;
  }) {
    return (
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="home-section-eyebrow inline-flex items-center gap-1.5">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {eyebrow}
          </span>
          <h2 className="home-section-title truncate">
            {title}
          </h2>
        </div>
        {href && (
          <Link 
            href={href}
            className="home-see-all group shrink-0"
          >
            <span className="hidden sm:inline">Voir tout</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        )}
      </div>
    );
  }

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
      <div className="relative group/carousel">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3 sm:gap-4 pb-2">
            {slides.map((ad) => (
              <div
                key={ad.id}
                className="flex-[0_0_72%] min-[360px]:flex-[0_0_62%] min-[420px]:flex-[0_0_46%] sm:flex-[0_0_31%] md:flex-[0_0_24%] xl:flex-[0_0_19%] min-w-0"
              >
                <AdCard ad={toAdCard(ad)} href={`/ads/${ad.id}`} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={scrollPrev}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-lg items-center justify-center text-zinc-700 hover:text-orange-600 hover:border-orange-200 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 active:scale-95"
          aria-label="Précédent"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-lg items-center justify-center text-zinc-700 hover:text-orange-600 hover:border-orange-200 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 active:scale-95"
          aria-label="Suivant"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div dir="ltr" className="min-h-screen bg-white font-sans text-zinc-900 pb-12">
      
      {/* Sell banner — light, compact CTA strip */}
      <section className="main-container">
        <SellBanner />
      </section>

      <main className="main-container pb-4 pt-6 sm:pt-8">
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
        <div className="space-y-8 sm:space-y-12 min-w-0 pt-2">
          {ads.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 rounded-[2.5rem] bg-zinc-50/40 px-4">
              <div className="bg-white p-6 rounded-2xl mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
                <Package className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Aucune annonce trouvée</h3>
              <p className="mt-2 text-sm text-zinc-500 font-medium max-w-xs">Soyez le premier à publier une annonce dans votre région.</p>
              <Link href="/marketplace/post" className="mt-8 inline-flex items-center justify-center gap-2 px-8 h-12 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-[0_12px_30px_rgba(255,102,0,0.18)] hover:shadow-[0_18px_40px_rgba(255,102,0,0.22)] active:scale-[0.98]">
                <PlusCircle className="w-5 h-5" />
                Déposer une annonce
              </Link>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="space-y-10">
                  {[...Array(2)].map((_, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="h-3 w-20 bg-zinc-100 animate-pulse rounded-full" />
                        <div className="h-7 w-44 bg-zinc-100 animate-pulse rounded-lg" />
                      </div>
                      <div className="flex gap-3 sm:gap-4 pb-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex-[0_0_72%] min-[360px]:flex-[0_0_62%] min-[420px]:flex-[0_0_46%] sm:flex-[0_0_31%] md:flex-[0_0_24%] xl:flex-[0_0_19%] shrink-0">
                            <div className="aspect-[4/3] bg-zinc-100 animate-pulse rounded-[1.5rem]" />
                            <div className="h-4 w-3/4 bg-zinc-100 animate-pulse rounded mt-3" />
                            <div className="h-4 w-1/3 bg-zinc-100 animate-pulse rounded mt-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {latestAds.length > 0 && (
                    <section className="space-y-4 sm:space-y-5 rounded-[1.75rem] border border-orange-100 bg-orange-50/40 p-3 sm:p-5">
                      <SectionHeader eyebrow="Nouveautés" title="Arrivés récemment" href="/marketplace" icon={Clock3} />
                      <CategoryCarousel items={latestAds} />
                    </section>
                  )}

                  {nearbyAds.length > 0 && (
                    <section className="space-y-4 sm:space-y-5">
                      <SectionHeader eyebrow="Autour de vous" title="Annonces proches" href="/marketplace" icon={MapPin} />
                      <CategoryCarousel items={nearbyAds} />
                    </section>
                  )}

                  {orderedCategories.map((category) => {
                    const categoryAds = groupedAds[category];
                    if (categoryAds.length === 0) return null;

                    const categoryLabel = CATEGORY_LABELS[category] || category;

                    return (
                      <section key={category} className="space-y-4 sm:space-y-5">
                        <SectionHeader eyebrow="Catégorie" title={categoryLabel} href={`/categories/${getCategorySlug(category)}`} icon={Sparkles} />
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

      {/* Trust / value proposition */}
      <TrustSection />
    </div>
  );
}
