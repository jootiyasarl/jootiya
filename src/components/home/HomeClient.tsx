"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { TrustSection } from "@/components/home/TrustSection";
import { type PublicAdCardAd } from "@/components/AdCard";
import { HomeAdCard, ProductGridSkeleton } from "@/components/home/HomeAdCard";
import { VirtualizedAdGrid } from "@/components/ads/VirtualizedAdGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
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



const SORT_OPTIONS = [
  { id: "recent", label: "Plus récents" },
  { id: "price-asc", label: "Prix : Moins cher" },
  { id: "price-desc", label: "Prix : Plus cher" },
  { id: "featured", label: "À la une d'abord" },
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
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "featured">("recent");
  const [feedTab, setFeedTab] = useState<"all" | "featured" | "nearby">("all");

  // Sort Dropdown State
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const listingsSectionRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("user_location");
          const storedLocation = stored ? JSON.parse(stored) : null;
          const lat = latParam || storedLocation?.lat;
          const lon = lngParam || storedLocation?.lon;

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
      }
      if (isMounted) setLoading(false);
      return;
    }

    async function initData() {
      if (!isMounted) return;

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

        // Fetch ALL ads without restricting by category or 12-ad limits
        const { data: allAds, error: adsError } = await supabase
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
          .or("status.eq.active,status.eq.approved,status.eq.pending,status.is.null")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1000);

        if (adsError) throw adsError;

        let resultData: HomepageAdRow[] = (allAds ?? []) as HomepageAdRow[];

        if (lat && lon) {
          resultData = resultData.map((ad) => {
            if (ad.latitude != null && ad.longitude != null) {
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
          });
        }

        if (resultData && isMounted) {
          const formattedAds = resultData.map(mapHomepageAdRow);
          setAds(formattedAds);
          setLoading(false);
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

  const selectedCategoryObj = useMemo(() => {
    return CATEGORIES_DATA.find((c) => c.id === selectedCategory) || CATEGORIES_DATA[0];
  }, [selectedCategory]);

  const currentSortObj = useMemo(() => {
    return SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];
  }, [sortBy]);

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

        {/* FEED TOP CONTROLS BAR: Responsive wrap on mobile */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
          {/* Feed Tabs Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide no-scrollbar">
            <Button
              type="button"
              onClick={() => setFeedTab("all")}
              variant={feedTab === "all" ? "default" : "outline"}
              className="rounded-xl h-9 text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Toutes</span>
            </Button>

            <Button
              type="button"
              onClick={() => setFeedTab("featured")}
              variant={feedTab === "featured" ? "orange" : "outline"}
              className="rounded-xl h-9 text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>À la une</span>
            </Button>

            <Button
              type="button"
              onClick={() => setFeedTab("nearby")}
              variant={feedTab === "nearby" ? "default" : "outline"}
              className="rounded-xl h-9 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Proches</span>
            </Button>
          </div>

          {/* Right Toolbar: Counter and Custom Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
              {filteredAds.length} annonce{filteredAds.length !== 1 ? "s" : ""}
            </span>

            {/* Custom Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                <span>{currentSortObj.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isSortDropdownOpen ? "rotate-180 text-orange-500" : ""}`} />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 text-left">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id as any);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                          isSelected
                            ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* THE VIRTUALIZED GRID WITH FLAT MINIMALIST SKELETON */}
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : (
          <VirtualizedAdGrid
            ads={virtualizedCardList}
            emptyMessage="Aucune annonce ne correspond à votre recherche"
            emptySubtext="Modifiez vos critères ou explorez une autre ville."
          />
        )}
      </section>


      {/* =========================================================================
          6. MOROCCAN CITIES EXPLORER
         ========================================================================= */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1.5">
                <Compass className="h-4 w-4" />
                Marché Local
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Explorez les offres par ville
              </h2>
            </div>
            <Link
              href="/cities"
              className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1.5 uppercase tracking-wider transition-colors"
            >
              <span>Toutes les villes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: "Casablanca", icon: Building2, count: "Économie & Tech" },
              { name: "Rabat", icon: Landmark, count: "Capitale & Pro" },
              { name: "Marrakech", icon: Palmtree, count: "Tourisme & Déco" },
              { name: "Tanger", icon: Anchor, count: "Nord & Auto" },
              { name: "Fès", icon: History, count: "Artisanat & Histoire" },
              { name: "Agadir", icon: Waves, count: "Souss & Mer" },
            ].map((city) => {
              const Icon = city.icon;
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city.name);
                    listingsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    selectedCity === city.name
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-105"
                      : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:shadow-sm hover:-translate-y-1"
                  }`}
                >
                  <div className="mb-2 group-hover:scale-110 transition-transform">
                    <Icon className={`h-6 w-6 ${selectedCity === city.name ? "text-white" : "text-orange-500 dark:text-orange-400"}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-black transition-colors ${selectedCity === city.name ? "text-white" : "text-zinc-900 dark:text-white group-hover:text-orange-600"}`}>
                      {city.name}
                    </h3>
                    <p className={`text-[11px] font-semibold truncate ${selectedCity === city.name ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"}`}>
                      {city.count}
                    </p>
                  </div>
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

