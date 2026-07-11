"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SellBanner } from "@/components/home/SellBanner";
import { TrustSection } from "@/components/home/TrustSection";
import { type PublicAdCardAd } from "@/components/AdCard";
import { HomeAdCard } from "@/components/home/HomeAdCard";
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
          console.log("Fetching standard ads per category...");
          const HOMEPAGE_CATEGORIES = [
            "electronics", "home-furniture", "vehicles", "fashion",
            "tools-equipment", "hobbies", "animals", "books",
            "used-clearance", "other",
          ];
          const ADS_PER_CAT = 6;

          const categoryResults = await Promise.all(
            HOMEPAGE_CATEGORIES.map((cat) =>
              supabase
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
                .eq("category", cat)
                .order("is_featured", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(ADS_PER_CAT)
            )
          );

          const allAds: HomepageAdRow[] = [];
          for (const res of categoryResults) {
            if (res.error) {
              console.error("Error fetching category ads:", res.error);
              continue;
            }
            allAds.push(...(res.data ?? []));
          }

          allAds.sort((a, b) => {
            const aF = a.is_featured ? 1 : 0;
            const bF = b.is_featured ? 1 : 0;
            if (bF !== aF) return bF - aF;
            return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
          });

          resultData = allAds;
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
    const slides = items.slice(0, 6);
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
                <HomeAdCard ad={toAdCard(ad)} />
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
          <div className="alert alert-error mb-6">
            <span className="font-bold">Impossible de charger les annonces : {error}</span>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-error btn-sm"
            >
              Réessayer
            </button>
          </div>
        )}
        <div className="space-y-8 sm:space-y-12 min-w-0 pt-2">
          {ads.length === 0 && !loading ? (
            <div className="card card-border border-dashed bg-zinc-50/50 p-8 py-16 text-center">
              <div className="card-body items-center gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                  <Package className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="card-title text-xl">Aucune annonce trouvée</h3>
                <p className="text-sm text-zinc-500 font-medium max-w-xs">Soyez le premier à publier une annonce dans votre région.</p>
                <Link href="/poste-annonce" className="btn btn-primary mt-4">
                  <PlusCircle className="w-5 h-5" />
                  Déposer une annonce
                </Link>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="space-y-10">
                  {[...Array(2)].map((_, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="skeleton h-3 w-20 rounded-full" />
                        <div className="skeleton h-7 w-44 rounded-lg" />
                      </div>
                      <div className="flex gap-3 sm:gap-4 pb-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex-[0_0_72%] min-[360px]:flex-[0_0_62%] min-[420px]:flex-[0_0_46%] sm:flex-[0_0_31%] md:flex-[0_0_24%] xl:flex-[0_0_19%] shrink-0">
                            <div className="skeleton aspect-[4/3] rounded-[1.5rem]" />
                            <div className="skeleton h-4 w-3/4 rounded mt-3" />
                            <div className="skeleton h-4 w-1/3 rounded mt-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {latestAds.length > 0 && (
                    <section className="card card-border bg-orange-50/40 p-4 sm:p-6 space-y-4 sm:space-y-5">
                      <SectionHeader eyebrow="Nouveautés" title="Arrivés récemment" href="/marketplace" icon={Clock3} />
                      <CategoryCarousel items={latestAds} />
                    </section>
                  )}

                  {nearbyAds.length > 0 && (
                    <section className="card card-border bg-white p-4 sm:p-6 space-y-4 sm:space-y-5">
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
