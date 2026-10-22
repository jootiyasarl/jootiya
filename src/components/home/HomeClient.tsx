"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
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
  ShieldCheck,
  Zap,
  TrendingUp,
  X,
  Compass,
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

const CATEGORIES_DATA = [
  { id: "all", label: "Tout", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
  { id: "electronics", label: "Électronique", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { id: "vehicles", label: "Véhicules", icon: Car, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { id: "home-furniture", label: "Maison & Meubles", icon: Armchair, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { id: "fashion", label: "Mode & Beauté", icon: Shirt, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/40" },
  { id: "tools-equipment", label: "Outils & Pro", icon: Hammer, color: "text-zinc-600 dark:text-zinc-300", bg: "bg-zinc-100 dark:bg-zinc-800" },
  { id: "hobbies", label: "Loisirs & Sport", icon: Gamepad2, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
  { id: "animals", label: "Animaux", icon: PawPrint, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { id: "books", label: "Livres & Scolaire", icon: BookOpen, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/40" },
  { id: "used-clearance", label: "Occasions", icon: Tag, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40" },
  { id: "other", label: "Autres", icon: Package, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" },
];

const MOROCCAN_CITIES = [
  "Toutes les villes",
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
];

const POPULAR_SEARCH_TAGS = [
  "iPhone 16",
  "Dacia Sandero",
  "Appartement Casablanca",
  "Golf 7",
  "PlayStation 5",
  "MacBook Pro",
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

  // Global Interactive Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("Toutes les villes");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "featured">("recent");
  const [feedTab, setFeedTab] = useState<"all" | "featured" | "nearby">("all");

  const listingsSectionRef = useRef<HTMLDivElement>(null);

  const latParam = typeof initialParams.lat === "string" ? parseFloat(initialParams.lat) : null;
  const lngParam = typeof initialParams.lng === "string" ? parseFloat(initialParams.lng) : null;
  const radiusParam =
    typeof initialParams.radius === "string" ? parseInt(initialParams.radius) : 50;

  // VIP Embla carousel
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
        console.error("IndexedDB error:", e);
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

  const virtualizedCardList = useMemo(() => {
    return filteredAds.map(toAdCard);
  }, [filteredAds, toAdCard]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listingsSectionRef.current) {
      listingsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("Toutes les villes");
    setSelectedCategory("all");
    setFeedTab("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCity !== "Toutes les villes" ||
    selectedCategory !== "all" ||
    feedTab !== "all";

  return (
    <div dir="ltr" className="min-h-screen bg-[#F8FAFC] dark:bg-[#07090E] font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* =========================================================================
          1. STATE-OF-THE-ART HERO SECTION (International Marketplace Hub)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-500/10 via-[#F8FAFC] to-[#F8FAFC] dark:from-orange-500/5 dark:via-[#07090E] dark:to-[#07090E] pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-zinc-200/60 dark:border-zinc-800/60">
        {/* Ambient background light orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-orange-500/15 via-amber-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative main-container text-center max-w-5xl mx-auto">
          {/* Moroccan Flagship Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-orange-500/20 shadow-sm text-xs font-black tracking-wide text-zinc-800 dark:text-zinc-200 mb-6">
            <span className="text-sm">🇲🇦</span>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-extrabold uppercase">
              Le N°1 des Petites Annonces au Maroc
            </span>
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.12] mb-4">
            Achetez & Vendez au Maroc <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              en toute confiance
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium mb-8 leading-relaxed">
            Téléphones, voitures, immobilier, meubles et plus de 50,000 articles d&apos;occasion et neufs vérifiés près de chez vous.
          </p>

          {/* =========================================================================
              AIRBNB-STYLE INTERACTIVE SEARCH CAPSULE
             ========================================================================= */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="mx-auto max-w-4xl p-2 sm:p-2.5 rounded-[2rem] bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl flex flex-col md:flex-row items-center gap-2"
          >
            {/* Input: Keyword */}
            <div className="relative flex-1 w-full flex items-center px-4 py-2">
              <Search className="h-5 w-5 text-orange-500 shrink-0 mr-3" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Recherche</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Que recherchez-vous ? (iPhone, Dacia, PC...)"
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-zinc-200 dark:bg-zinc-800" />

            {/* Select: Category */}
            <div className="relative w-full md:w-52 flex items-center px-4 py-2">
              <Sparkles className="h-4 w-4 text-zinc-400 shrink-0 mr-2.5" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Catégorie</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES_DATA.map((c) => (
                    <option key={c.id} value={c.id} className="dark:bg-zinc-900">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-zinc-200 dark:bg-zinc-800" />

            {/* Select: City */}
            <div className="relative w-full md:w-48 flex items-center px-4 py-2">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mr-2.5" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Ville</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city} className="dark:bg-zinc-900">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>Trouver</span>
            </button>
          </form>

          {/* Popular Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs">
            <span className="font-bold text-zinc-400 text-[11px] flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-orange-500" /> Populaire :
            </span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  listingsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-1 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Live Trust Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-10">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm text-left">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-black text-zinc-900 dark:text-white">+50,000</div>
                <div className="text-[10px] font-bold text-zinc-500">Annonces actives</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm text-left">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-black text-zinc-900 dark:text-white">100%</div>
                <div className="text-[10px] font-bold text-zinc-500">Modéré & Sécurisé</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm text-left">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-black text-zinc-900 dark:text-white">30+ Villes</div>
                <div className="text-[10px] font-bold text-zinc-500">Partout au Maroc</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm text-left">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-black text-zinc-900 dark:text-white">Gratuit</div>
                <div className="text-[10px] font-bold text-zinc-500">Dépôt en 2 min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. VISUAL CATEGORIES SHOWCASE
         ========================================================================= */}
      <section className="main-container py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              Explorer par catégorie
            </h2>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Découvrez les offres les plus recherchées au Maroc
            </p>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-black text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 uppercase tracking-wider group"
          >
            <span>Tout voir</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5 sm:gap-3">
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
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-105"
                    : "bg-white dark:bg-zinc-900/80 border-zinc-200/70 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-orange-500/40 hover:shadow-md hover:-translate-y-1"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                    isSelected ? "bg-white/20 text-white" : `${cat.bg} ${cat.color}`
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-black text-center line-clamp-1">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. VIP SPOTLIGHT "À LA UNE" CAROUSEL
         ========================================================================= */}
      {featuredVipAds.length > 0 && selectedCategory === "all" && !hasActiveFilters && (
        <section className="main-container pb-8">
          <div className="rounded-[2rem] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-500/10 dark:via-orange-500/5 dark:to-transparent p-5 sm:p-7 border border-amber-500/20 shadow-sm relative group/carousel">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/30">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Sélection VIP Exclusive</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      À la une
                    </span>
                  </h2>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Les annonces vérifiées les plus demandées en ce moment
                  </p>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-orange-600 hover:border-orange-300 transition-all active:scale-95"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-orange-600 hover:border-orange-300 transition-all active:scale-95"
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
      <section ref={listingsSectionRef} className="main-container pb-14 pt-2">
        {error && (
          <div className="alert alert-error mb-6 rounded-2xl shadow-sm">
            <span className="font-bold">Erreur : {error}</span>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-error btn-sm rounded-xl"
            >
              Actualiser
            </button>
          </div>
        )}

        {/* FEED TOP CONTROLS BAR */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          {/* Feed Tabs Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <button
              type="button"
              onClick={() => setFeedTab("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                feedTab === "all"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              ✨ Toutes les annonces
            </button>

            <button
              type="button"
              onClick={() => setFeedTab("featured")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                feedTab === "featured"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              🔥 À la une
            </button>

            <button
              type="button"
              onClick={() => setFeedTab("nearby")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                feedTab === "nearby"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              📍 Proches de moi
            </button>
          </div>

          {/* Right Toolbar: Counter and Sort Select */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
              {filteredAds.length} annonce{filteredAds.length !== 1 ? "s" : ""}
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-zinc-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix : Moins cher</option>
                <option value="price-desc">Prix : Plus cher</option>
                <option value="featured">À la une d&apos;abord</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Tag Pills (if any) */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-zinc-400">Filtres actifs :</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 font-bold">
                Catégorie : {selectedCategory}
                <X className="h-3.5 w-3.5 cursor-pointer hover:scale-110" onClick={() => setSelectedCategory("all")} />
              </span>
            )}
            {selectedCity !== "Toutes les villes" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold">
                Ville : {selectedCity}
                <X className="h-3.5 w-3.5 cursor-pointer hover:scale-110" onClick={() => setSelectedCity("Toutes les villes")} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold">
                Recherche : &quot;{searchQuery}&quot;
                <X className="h-3.5 w-3.5 cursor-pointer hover:scale-110" onClick={() => setSearchQuery("")} />
              </span>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-red-500 hover:text-red-700 underline ml-2"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* THE VIRTUALIZED GRID */}
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
            emptySubtext="Modifiez votre recherche ou explorez une autre ville / catégorie."
          />
        )}
      </section>

      {/* =========================================================================
          5. MOROCCAN CITIES QUICK EXPLORER
         ========================================================================= */}
      <section className="main-container pb-14">
        <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                <Compass className="h-4 w-4" />
                Marché Local Marocain
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Explorez les annonces par ville
              </h2>
            </div>
            <Link
              href="/cities"
              className="text-xs font-black text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 uppercase tracking-wider group shrink-0"
            >
              <span>Toutes les villes</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: "Casablanca", icon: "🏙️", count: "Économie & Tech" },
              { name: "Rabat", icon: "🏛️", count: "Capitale & Pro" },
              { name: "Marrakech", icon: "🌴", count: "Tourisme & Déco" },
              { name: "Tanger", icon: "⚓", count: "Nord & Auto" },
              { name: "Fès", icon: "🏺", count: "Artisanat & Maison" },
              { name: "Agadir", icon: "🌊", count: "Souss & Loisirs" },
            ].map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => {
                  setSelectedCity(city.name);
                  listingsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/70 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-left flex flex-col justify-between"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {city.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400">
                    {city.count}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TRUST & VALUE PROPOSITION (Bento Grid)
         ========================================================================= */}
      <TrustSection />
    </div>
  );
}
