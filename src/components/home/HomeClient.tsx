"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { TrustSection } from "@/components/home/TrustSection";
import { type PublicAdCardAd } from "@/components/AdCard";
import { HomeAdCard, ProductGridSkeleton } from "@/components/home/HomeAdCard";
import { VirtualizedAdGrid } from "@/components/ads/VirtualizedAdGrid";
import { InfiniteAdFeed } from "@/components/home/InfiniteAdFeed";
import { AdUnit } from "@/components/ads/AdUnit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
  Flame,
  X,
  Compass,
  PlusCircle,
  Building2,
  Landmark,
  Palmtree,
  Anchor,
  History,
  Waves,
} from "lucide-react";
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
  status?: string | null;
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

const CATEGORIES_DATA = [
  { id: "all", label: "Tout explorer", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
  { id: "electronics", label: "Électronique", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { id: "vehicles", label: "Véhicules", icon: Car, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { id: "home-furniture", label: "Maison", icon: Armchair, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { id: "fashion", label: "Mode", icon: Shirt, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/40" },
  { id: "tools-equipment", label: "Outils", icon: Hammer, color: "text-zinc-600 dark:text-zinc-300", bg: "bg-zinc-100 dark:bg-zinc-800" },
  { id: "hobbies", label: "Loisirs", icon: Gamepad2, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
  { id: "animals", label: "Animaux", icon: PawPrint, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { id: "books", label: "Livres", icon: BookOpen, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/40" },
  { id: "used-clearance", label: "Occasions", icon: Tag, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40" },
  { id: "other", label: "Autres", icon: Package, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" },
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
  initialHasMore = false,
  statsBar,
}: {
  initialParams: HomeInitialParams;
  initialAds?: HomepageAdRow[];
  initialHasMore?: boolean;
  /** Server-rendered social-proof strip (StatsBar) — zero client JS */
  statsBar?: React.ReactNode;
}) {
  const [ads, setAds] = useState<HomepageAd[]>(() =>
    (initialAds || []).map(mapHomepageAdRow)
  );
  const [loading, setLoading] = useState(!initialAds?.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAds && initialAds.length > 0) {
      setAds(initialAds.map(mapHomepageAdRow));
      setLoading(false);
    }
  }, [initialAds]);

  // Global Interactive Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("Toutes les villes");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Feed sort/tab are fixed defaults — the controls UI was removed.
  const [sortBy] = useState<"recent" | "price-asc" | "price-desc" | "featured">("recent");
  const [feedTab] = useState<"all" | "featured" | "nearby">("all");

  const listingsSectionRef = useRef<HTMLDivElement>(null);
  // Lazy reveal: the ads grid fades in only when the section enters the viewport
  const [gridVisible, setGridVisible] = useState(false);
  useEffect(() => {
    const el = listingsSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setGridVisible(true); observer.disconnect(); } },
      { threshold: 0.01, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const latParam = typeof initialParams.lat === "string" ? parseFloat(initialParams.lat) : null;
  const lngParam = typeof initialParams.lng === "string" ? parseFloat(initialParams.lng) : null;

  // VIP Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Enrich ads with client-side distance if localStorage has coords
  useEffect(() => {
    if (!initialAds?.length) return;

    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem("user_location");
      const storedLocation = stored ? JSON.parse(stored) : null;
      const lat = latParam ?? storedLocation?.lat;
      const lon = lngParam ?? storedLocation?.lon;

      if (lat && lon) {
        setAds((prev) =>
          prev.map((ad) => {
            if (ad.latitude && ad.longitude && typeof ad.distanceKm !== "number") {
              const dLat = ((ad.latitude - lat) * Math.PI) / 180;
              const dLon = ((ad.longitude - lon) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((lat * Math.PI) / 180) *
                  Math.cos((ad.latitude * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return { ...ad, distanceKm: 6371 * c };
            }
            return ad;
          })
        );
      }
    } catch (e) {
      console.error("Distance calculation error:", e);
    }

    setLoading(false);
  }, [latParam, lngParam, initialAds]);

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

  const featuredVipAds = useMemo(() => {
    return ads.filter((ad) => ad.isFeatured).slice(0, 10);
  }, [ads]);

  // Main Filter & Sort
  const filteredAds = useMemo(() => {
    let result = [...ads];

    // Feed tab filter (all, featured, nearby)
    if (feedTab === "featured") {
      result = result.filter((ad) => ad.isFeatured);
    } else if (feedTab === "nearby") {
      result = result.filter(
        (ad) => typeof ad.distanceKm === "number" && Number.isFinite(ad.distanceKm)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((ad) => {
        const cat = ad.categorySlug?.toLowerCase() || "";
        const target = selectedCategory.toLowerCase();
        return cat === target || cat.includes(target);
      });
    }

    // City filter
    if (selectedCity !== "Toutes les villes") {
      const cityLower = selectedCity.toLowerCase();
      result = result.filter((ad) => ad.location.toLowerCase().includes(cityLower));
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
  }, [ads, feedTab, selectedCategory, selectedCity, searchQuery, sortBy]);

  // virtualizedCardList is preserved for the VIP featured carousel (toAdCard mapping)
  const virtualizedCardList = useMemo(() => {
    return filteredAds.map(toAdCard);
  }, [filteredAds, toAdCard]);


  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("Toutes les villes");
    setSelectedCategory("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCity !== "Toutes les villes" ||
    selectedCategory !== "all";

  // ── Feed filter params → forwarded to /api/ads for server-side filtering ──
  const apiParams = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedCategory !== "all") {
      const cat = CATEGORIES_DATA.find((c) => c.id === selectedCategory);
      p.set("category", selectedCategory);
      if (cat) p.set("categoryLabel", cat.label);
    }
    if (selectedCity !== "Toutes les villes") p.set("city", selectedCity);
    if (searchQuery.trim()) p.set("q", searchQuery.trim());
    return p.toString();
  }, [selectedCategory, selectedCity, searchQuery]);

  const feedFiltersActive =
    selectedCategory !== "all" ||
    selectedCity !== "Toutes les villes" ||
    searchQuery.trim() !== "";

  const selectedCategoryObj = useMemo(() => {
    return CATEGORIES_DATA.find((c) => c.id === selectedCategory) || CATEGORIES_DATA[0];
  }, [selectedCategory]);

  return (
    <div dir="ltr" className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 selection:bg-orange-500 selection:text-white">
      
      {/* =========================================================================
          1. HORIZONTAL CATEGORIES BAR (Swipeable & Native feel)
         ========================================================================= */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              Explorer par catégorie
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1.5 uppercase tracking-wider transition-colors"
          >
            <span>Toutes les catégories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Smooth horizontal scroll */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES_DATA.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  listingsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-orange-500/40 hover:text-orange-600 hover:shadow-sm"
                }`}
              >
                <div className={`p-1 rounded-lg ${isSelected ? "bg-white/20 text-white" : cat.bg}`}>
                  <Icon
                    className={`h-4 w-4 ${
                      isSelected ? "text-white" : `${cat.color} group-hover:scale-110 transition-transform`
                    }`}
                  />
                </div>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Social-proof stats strip (server-rendered, no client JS) */}
      {statsBar}

      {/* =========================================================================
          3. VIP SPOTLIGHT "À LA UNE" CAROUSEL
         ========================================================================= */}
      {featuredVipAds.length > 0 && selectedCategory === "all" && !hasActiveFilters && (
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-500/10 dark:via-orange-500/5 dark:to-amber-500/10 p-4 sm:p-6 border border-amber-500/20 dark:border-amber-500/30 shadow-sm relative group/carousel">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Sélection VIP Exclusive</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      À la une
                    </span>
                  </h2>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  type="button"
                  onClick={scrollPrev}
                  size="icon"
                  variant="outline"
                  className="rounded-full h-8 w-8"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  onClick={scrollNext}
                  size="icon"
                  variant="outline"
                  className="rounded-full h-8 w-8"
                  aria-label="Suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3 sm:gap-4 pb-2">
                {featuredVipAds.map((ad) => (
                  <div
                    key={`vip-${ad.id}`}
                    className="flex-[0_0_70%] min-[380px]:flex-[0_0_60%] min-[440px]:flex-[0_0_48%] sm:flex-[0_0_32%] md:flex-[0_0_25%] min-w-0"
                  >
                    <HomeAdCard ad={toAdCard(ad)} priority />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          4. THE CORE VIRTUALIZED FEED (@tanstack/react-virtual)
         ========================================================================= */}
      <section ref={listingsSectionRef} className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="alert alert-error mb-6 rounded-2xl shadow-lg text-sm p-4">
            <span className="font-bold">Erreur : {error}</span>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-error btn-sm rounded-xl ml-4"
            >
              Actualiser
            </button>
          </div>
        )}

        {/* Active Filters Tag Pills */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">Filtres actifs :</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 font-semibold text-xs">
                {selectedCategoryObj.label}
                <X className="h-3.5 w-3.5 cursor-pointer hover:scale-110" onClick={() => setSelectedCategory("all")} />
              </span>
            )}
            {selectedCity !== "Toutes les villes" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                {selectedCity}
                <X className="h-3.5 w-3.5 cursor-pointer hover:scale-110" onClick={() => setSelectedCity("Toutes les villes")} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold text-xs">
                &quot;{searchQuery}&quot;
                <X className="h-3.5 w-3.5 cursor-pointer hover:scale-110" onClick={() => setSearchQuery("")} />
              </span>
            )}
            <Button
              type="button"
              onClick={handleClearFilters}
              variant="ghost"
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 px-2.5"
            >
              Effacer tout
            </Button>
          </div>
        )}

        {/* THE FEED — Infinite Scroll: SSR first batch + client-side pagination */}
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : !gridVisible ? (
          /* Placeholder height so scroll position doesn't jump before reveal */
          <div className="min-h-[600px] flex items-start justify-center pt-16">
            <ProductGridSkeleton count={12} />
          </div>
        ) : (
          <div
            style={{
              animation: "fadeSlideUp 0.5s ease both",
            }}
          >
            <style>{`
              @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(24px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            {/*
             * InfiniteAdFeed receives the SSR-rendered first 10 ads and handles
             * all subsequent pages via /api/ads + IntersectionObserver sentinel.
             * filterKey encodes the current filter state — when it changes, the
             * feed resets its client-side page counter to 1.
             */}
            <InfiniteAdFeed
              initialAds={initialAds || []}
              initialHasMore={initialHasMore}
              pageSize={10}
              filterKey={`${feedTab}|${selectedCategory}|${selectedCity}|${sortBy}|${searchQuery}`}
              apiParams={apiParams}
              fetchFirstPage={feedFiltersActive}
              emptyMessage="Aucune annonce ne correspond à votre recherche"
              emptySubtext="Modifiez vos critères ou explorez une autre ville."
            />
          </div>
        )}
      </section>

      {/* =========================================================================
          5b. ADVERTISEMENT — between listings feed and cities explorer
         ========================================================================= */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdUnit format="auto" minHeight={100} />
      </section>


      {/* =========================================================================
          6. MOROCCAN CITIES EXPLORER
         ========================================================================= */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                <Compass className="h-3.5 w-3.5" />
                Marché Local
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                Explorez les offres par ville
              </h2>
            </div>
            <Link
              href="/cities"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 uppercase tracking-wider transition-colors"
            >
              <span>Toutes les villes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Compact OLX-style city links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { name: "Casablanca", icon: Building2, count: "Économie & Tech" },
              { name: "Rabat", icon: Landmark, count: "Capitale & Pro" },
              { name: "Marrakech", icon: Palmtree, count: "Tourisme & Déco" },
              { name: "Tanger", icon: Anchor, count: "Nord & Auto" },
              { name: "Fès", icon: History, count: "Artisanat & Histoire" },
              { name: "Agadir", icon: Waves, count: "Souss & Mer" },
            ].map((city) => {
              const Icon = city.icon;
              const isSelected = selectedCity === city.name;
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city.name);
                    listingsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/25"
                      : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800 hover:border-orange-400/60 hover:bg-orange-50/60 dark:hover:bg-orange-950/20"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-orange-500 dark:text-orange-400"}`} />
                  <span className="min-w-0">
                    <span className={`block text-[13px] font-bold truncate ${isSelected ? "text-white" : "text-zinc-800 dark:text-zinc-100 group-hover:text-orange-600"}`}>
                      {city.name}
                    </span>
                    <span className={`block text-[10px] font-medium truncate ${isSelected ? "text-white/80" : "text-zinc-400 dark:text-zinc-500"}`}>
                      {city.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. TRUST & VALUE PROPOSITION
         ========================================================================= */}
      <TrustSection />
    </div>
  );
}

