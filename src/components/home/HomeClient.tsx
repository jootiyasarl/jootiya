"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { SellBanner } from "@/components/home/SellBanner";
import { TrustSection } from "@/components/home/TrustSection";
import { type PublicAdCardAd } from "@/components/AdCard";
import { HomeAdCard } from "@/components/home/HomeAdCard";
import { VirtualizedAdGrid } from "@/components/ads/VirtualizedAdGrid";
import {
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock3,
  MapPin,
  Sparkles,
  Smartphone,
  Car,
  Armchair,
  Shirt,
  Hammer,
  Gamepad2,
  PawPrint,
  BookOpen,
  Tag,
  Search,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { getCachedAds, saveAds } from "@/lib/pwa/jootiya-db";
import { supabase } from "@/lib/supabaseClient";
import { fetchNearbyAds } from "@/lib/nearbyAds";
import useEmblaCarousel from "embla-carousel-react";

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
  profiles?:
    | {
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
      }
    | Array<{
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
      }>;
  sellerName?: string;
  seller_name?: string;
  sellerAvatar?: string;
  seller_avatar?: string;
};

const CATEGORY_TABS = [
  { id: "all", label: "Toutes les annonces", icon: Sparkles },
  { id: "featured", label: "À la une", icon: Flame },
  { id: "nearby", label: "Proches de moi", icon: MapPin },
  { id: "electronics", label: "Électronique", icon: Smartphone },
  { id: "vehicles", label: "Véhicules", icon: Car },
  { id: "home-furniture", label: "Maison & Meubles", icon: Armchair },
  { id: "fashion", label: "Mode & Vêtements", icon: Shirt },
  { id: "tools-equipment", label: "Outils & Bricolage", icon: Hammer },
  { id: "hobbies", label: "Loisirs & Sport", icon: Gamepad2 },
  { id: "animals", label: "Animaux", icon: PawPrint },
  { id: "books", label: "Livres & Études", icon: BookOpen },
  { id: "used-clearance", label: "Occasions", icon: Tag },
  { id: "other", label: "Autres", icon: Package },
];

function mapHomepageAdRow(row: HomepageAdRow): HomepageAd {
  const locationParts: string[] = [];
  if (row.neighborhood) locationParts.push(row.neighborhood);
  if (row.city) locationParts.push(row.city);
  const location = locationParts.join(", ") || "Maroc";

  let createdAtLabel: string | undefined;
  if (row.created_at) {
    const d = new Date(row.created_at);
    if (!Number.isNaN(d.getTime())) {
      createdAtLabel =
        d.toLocaleDateString("fr-FR", { month: "short", day: "numeric" }) +
        " à " +
        d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
  }

  const images = row.images || row.image_urls;
  const primaryImageUrl =
    Array.isArray(images) && images.length > 0 ? (images[0] as string) : undefined;
  const currency = typeof row.currency === "string" ? row.currency.trim() : "MAD";
  const priceLabel = row.price != null ? `${row.price} ${currency || "MAD"}` : "—";

  const profile = row.profiles;
  const profileObj = Array.isArray(profile) ? profile[0] : profile;

  const sellerName =
    (typeof row.sellerName === "string" ? row.sellerName : undefined) ||
    (typeof row.seller_name === "string" ? row.seller_name : undefined) ||
    profileObj?.full_name ||
    profileObj?.username ||
    "Utilisateur";

  const sellerAvatar =
    (typeof row.sellerAvatar === "string" ? row.sellerAvatar : undefined) ||
    (typeof row.seller_avatar === "string" ? row.seller_avatar : undefined) ||
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
    distanceKm:
      row.distanceKm ?? (row.dist_meters != null ? row.dist_meters / 1000 : undefined),
    sellerName,
    sellerAvatar: sellerAvatar || undefined,
  };
}

export default function HomeClient({
  initialParams,
  initialAds,
}: {
  initialParams: HomeInitialParams;
  initialAds?: HomepageAdRow[];
}) {
  const [ads, setAds] = useState<HomepageAd[]>(() =>
    (initialAds || []).map(mapHomepageAdRow)
  );
  const [loading, setLoading] = useState(!initialAds?.length);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "featured">("recent");

  const latParam = typeof initialParams.lat === "string" ? parseFloat(initialParams.lat) : null;
  const lngParam = typeof initialParams.lng === "string" ? parseFloat(initialParams.lng) : null;
  const radiusParam =
    typeof initialParams.radius === "string" ? parseInt(initialParams.radius) : 50;

  // Embla carousel for top featured VIP ads
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    let isMounted = true;

    if (initialAds?.length) {
      if (isMounted) setLoading(false);
      return;
    }

    async function initData() {
      if (!isMounted) return;

      try {
        if (typeof window !== "undefined") {
          const cached = await getCachedAds();
          if (cached && cached.length > 0 && isMounted) {
            setAds(cached);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("IndexedDB cache read error:", e);
      }

      try {
        let storedLocation = null;
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("user_location");
            storedLocation = stored ? JSON.parse(stored) : null;
          } catch (e) {
            console.error("LocalStorage error:", e);
          }
        }

        const lat = latParam || storedLocation?.lat;
        const lon = lngParam || storedLocation?.lon;

        let resultData: HomepageAdRow[] | null = null;
        if (lat && lon) {
          resultData = await fetchNearbyAds({
            latitude: lat,
            longitude: lon,
            radiusKm: radiusParam,
            limit: 60,
          });
        } else {
          const HOMEPAGE_CATEGORIES = [
            "electronics",
            "home-furniture",
            "vehicles",
            "fashion",
            "tools-equipment",
            "hobbies",
            "animals",
            "books",
            "used-clearance",
            "other",
          ];
          const ADS_PER_CAT = 12;

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
            if (res.error) continue;
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
          const formattedAds = resultData.map(mapHomepageAdRow);
          setAds(formattedAds);
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
    return () => {
      isMounted = false;
    };
  }, [latParam, lngParam, radiusParam, initialAds]);

  const toAdCard = useCallback(
    (ad: HomepageAd): PublicAdCardAd => ({
      id: ad.id,
      title: ad.title,
      price: ad.price,
      location: ad.location,
      createdAt: ad.createdAt,
      sellerBadge: ad.sellerBadge,
      isFeatured: ad.isFeatured,
      imageUrl: ad.imageUrl,
    }),
    []
  );

  // VIP Featured Carousel items
  const featuredVipAds = useMemo(() => {
    return ads.filter((ad) => ad.isFeatured).slice(0, 10);
  }, [ads]);

  // Main Filter & Sort computed list
  const filteredAds = useMemo(() => {
    let result = [...ads];

    // Category Filter
    if (selectedCategory === "featured") {
      result = result.filter((ad) => ad.isFeatured);
    } else if (selectedCategory === "nearby") {
      result = result.filter(
        (ad) => typeof ad.distanceKm === "number" && Number.isFinite(ad.distanceKm)
      );
    } else if (selectedCategory !== "all") {
      result = result.filter((ad) => {
        const cat = ad.categorySlug?.toLowerCase() || "";
        const target = selectedCategory.toLowerCase();
        return cat === target || cat.includes(target);
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ad) =>
          ad.title.toLowerCase().includes(q) ||
          ad.location.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
        return pB - pA;
      });
    } else if (sortBy === "featured") {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [ads, selectedCategory, searchQuery, sortBy]);

  const virtualizedCardList = useMemo(() => {
    return filteredAds.map(toAdCard);
  }, [filteredAds, toAdCard]);

  return (
    <div dir="ltr" className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pb-16">
      
      {/* Top Sell Banner Strip */}
      <section className="main-container pt-2">
        <SellBanner />
      </section>

      {/* Main Container */}
      <main className="main-container pb-8 pt-4 sm:pt-6">
        {error && (
          <div className="alert alert-error mb-6 rounded-2xl shadow-sm">
            <span className="font-bold">Erreur de chargement : {error}</span>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-error btn-sm rounded-xl"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* =========================================================================
            INTERNATIONAL CATEGORY FILTER NAVIGATION BAR (Airbnb / Dubizzle style)
           ========================================================================= */}
        <section className="mb-6 rounded-[1.75rem] bg-white dark:bg-zinc-900 p-2 sm:p-3 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide px-2">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`group flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                      : "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-orange-500"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            INTERACTIVE SEARCH & SORTING TOOLBAR
           ========================================================================= */}
        <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
          {/* Quick Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer par titre ou ville..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 pl-10 pr-4 py-2 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Result Count and Sort Select */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
              {filteredAds.length} annonce{filteredAds.length !== 1 ? "s" : ""}
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-zinc-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix : Moins cher</option>
                <option value="price-desc">Prix : Plus cher</option>
                <option value="featured">À la une d&apos;abord</option>
              </select>
            </div>
          </div>
        </section>

        {/* =========================================================================
            VIP SPOTLIGHT CAROUSEL (Showcased only on 'all' or 'featured')
           ========================================================================= */}
        {selectedCategory === "all" && featuredVipAds.length > 0 && !searchQuery && (
          <section className="mb-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-4 sm:p-6 border border-amber-500/20 shadow-sm relative group/carousel">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30">
                  <Flame className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                    Sélection VIP &quot;À la une&quot;
                  </h2>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Les meilleures offres vérifiées et mises en avant au Maroc
                  </p>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-orange-600 hover:border-orange-300 transition-all active:scale-95"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-orange-600 hover:border-orange-300 transition-all active:scale-95"
                  aria-label="Suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3 sm:gap-4 pb-2">
                {featuredVipAds.map((ad) => (
                  <div
                    key={`vip-${ad.id}`}
                    className="flex-[0_0_72%] min-[360px]:flex-[0_0_62%] min-[420px]:flex-[0_0_46%] sm:flex-[0_0_31%] md:flex-[0_0_24%] xl:flex-[0_0_20%] min-w-0"
                  >
                    <HomeAdCard ad={toAdCard(ad)} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            THE CORE: HIGH PERFORMANCE VIRTUALIZED AD GRID (@tanstack/react-virtual)
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Toutes les annonces disponibles</span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-900/40">
                Ultra-rapide
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-3"
                >
                  <div className="aspect-[4/3] rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <VirtualizedAdGrid
              ads={virtualizedCardList}
              emptyMessage="Aucune annonce ne correspond à votre recherche"
              emptySubtext="Essayez de changer de catégorie ou de réinitialiser la recherche."
            />
          )}
        </section>
      </main>

      {/* Trust & Guarantees Section */}
      <TrustSection />
    </div>
  );
}
