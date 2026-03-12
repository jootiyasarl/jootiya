"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, LayoutGrid, X, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";
import { supabase } from "@/lib/supabaseClient";
import { generateSlug } from "@/lib/seo-utils";

const CATEGORIES = [
  { id: "all", label: "Toutes les catégories" },
  { id: "electronics", label: "Électronique" },
  { id: "home-furniture", label: "Maison & Ameublement" },
  { id: "vehicles", label: "Véhicules & Transport" },
  { id: "fashion", label: "Mode & Chaussures" },
  { id: "tools-equipment", label: "Outils & Équipement" },
  { id: "hobbies", label: "Loisirs & Divertissement" },
  { id: "animals", label: "Animaux" },
  { id: "books", label: "Livres & Études" },
  { id: "used-clearance", label: "Occasions / Vide-grenier" },
  { id: "other", label: "Autres" },
] as const;

const ALL_CITIES = [
  "Toutes les villes",
  ...MOROCCAN_CITIES.flatMap((r) => r.cities).sort((a, b) => a.localeCompare(b)),
];

type AutocompleteSuggestion = {
  id: string;
  title: string;
  price?: number | null;
  currency?: string | null;
  city?: string | null;
  image_urls?: string[] | null;
  slug?: string | null;
};

type ActiveField = "product" | "category" | "city" | null;

export function JootiyaProSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [city, setCity] = useState<string>("Toutes les villes");

  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0],
    [categoryId]
  );

  useEffect(() => {
    const q = searchParams?.get("q") ?? "";
    const spCategory = searchParams?.get("category") ?? "";
    const spCity = searchParams?.get("city") ?? "";

    setQuery(q);
    if (CATEGORIES.some((c) => c.id === spCategory)) {
      setCategoryId(spCategory as any);
    } else {
      setCategoryId("all");
    }
    setCity(spCity || "Toutes les villes");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    const normalizedQuery = (() => {
      const q = trimmed.toLowerCase();
      if (["tomobil", "tomobile", "automobil", "automobile", "auto", "car"].includes(q)) {
        return "voiture سيارة";
      }
      return trimmed;
    })();

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    setLoadingSuggestions(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc("search_ads_smart", {
          search_query: normalizedQuery,
          similarity_threshold: 0.3,
          result_limit: 20,
        });

        if (error || !data) {
          setSuggestions([]);
          return;
        }

        let filtered: any[] = data;

        if (categoryId && categoryId !== "all") {
          filtered = filtered.filter((ad) => {
            const c = (ad?.category ?? "") as string;
            const cid = (ad?.category_id ?? "") as string;
            return (
              c.toLowerCase() === categoryId.toLowerCase() ||
              c.toLowerCase().includes(categoryId.toLowerCase()) ||
              cid.toLowerCase() === categoryId.toLowerCase() ||
              cid.toLowerCase().includes(categoryId.toLowerCase())
            );
          });
        }

        if (city && city !== "Toutes les villes") {
          filtered = filtered.filter((ad) => ad?.city === city);
        }

        const mapped: AutocompleteSuggestion[] = filtered.slice(0, 5).map((ad) => ({
          id: ad.id,
          title: ad.title,
          price: ad.price,
          currency: ad.currency,
          city: ad.city,
          image_urls: ad.image_urls,
          slug: ad.slug,
        }));

        setSuggestions(mapped);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, categoryId, city]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSuggestions([]);
        setActiveField(null);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setSuggestions([]);
        setActiveField(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const runSearch = (override?: { q?: string; category?: string; city?: string }) => {
    const q = (override?.q ?? query).trim();
    const cat = override?.category ?? categoryId;
    const c = override?.city ?? city;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "all") params.set("category", cat);
    if (c && c !== "Toutes les villes") params.set("city", c);

    const qs = params.toString();
    router.push(`/marketplace${qs ? `?${qs}` : ""}`);

    setActiveField(null);
    setMobileOpen(false);
  };

  return (
    <div className="w-full" ref={rootRef}>
      {/* Desktop (Airbnb-like segmented bar) */}
      <div className="hidden lg:block">
        <div
          className={cn(
            "relative max-w-4xl mx-auto",
            "flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-1",
            "transition-all hover:border-orange-500"
          )}
        >
          {/* Product */}
          <div className="flex-[2] flex items-center px-4 py-2 min-w-0 border-r border-zinc-100 dark:border-zinc-800">
            <Search className="w-4.5 h-4.5 text-zinc-400 mr-2 shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveField("product");
              }}
              onFocus={(e) => {
                e.stopPropagation();
                setActiveField("product");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder="شنو كتقلب؟ (مثلا: Golf 7...)"
              className="w-full bg-transparent outline-none text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400"
            />
          </div>

          {/* Category */}
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveField((v) => (v === "category" ? null : "category"));
            }}
            className="flex-1 flex items-center px-4 py-2 min-w-0 border-r border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 rounded-xl transition-colors cursor-pointer z-[110]"
          >
            <LayoutGrid className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
            <span className="truncate text-[13px] font-bold text-zinc-600 dark:text-zinc-300">
              {selectedCategory.label}
            </span>
          </div>

          {/* City */}
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveField((v) => (v === "city" ? null : "city"));
            }}
            className="flex-1 flex items-center px-4 py-2 min-w-0 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 rounded-xl transition-colors cursor-pointer z-[110]"
          >
            <MapPin className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
            <span className="truncate text-[13px] font-bold text-zinc-600 dark:text-zinc-300">{city}</span>
          </div>

          {/* Search Button */}
          <Button
            size="icon"
            onClick={() => runSearch()}
            className="ml-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
            aria-label="بحث"
            title="بحث"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Dropdowns */}
          {activeField === "product" && (suggestions.length > 0 || loadingSuggestions) && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] min-h-[50px]">
              {loadingSuggestions && (
                <div className="px-4 py-3 text-sm text-zinc-500 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </div>
              )}
              {!loadingSuggestions &&
                suggestions.map((s) => {
                  const slug = s.slug || generateSlug(s.title);
                  const href = `/ads/${s.id}/${slug}`;
                  const img = s.image_urls?.[0] || "/placeholder.png";
                  const priceText = s.price !== null && s.price !== undefined ? `${s.price} ${s.currency || "MAD"}` : "";

                  return (
                    <Link
                      key={s.id}
                      href={href}
                      onClick={() => {
                        setSuggestions([]);
                        setActiveField(null);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        <img src={img} alt={s.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-600">
                          {s.title}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {s.city ? `${s.city} • ` : ""}
                          {priceText ? <span className="text-orange-600 font-black">{priceText}</span> : null}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-600 shrink-0" />
                    </Link>
                  );
                })}
            </div>
          )}

          {activeField === "category" && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] max-h-[360px] overflow-y-auto min-w-[200px]">
              {CATEGORIES.map((c) => {
                const selected = c.id === categoryId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setActiveField(null);
                      runSearch({ category: c.id });
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                      selected
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-200"
                    )}
                  >
                    <span className="text-sm font-bold">{c.label}</span>
                    {selected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          )}

          {activeField === "city" && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] max-h-[360px] overflow-y-auto min-w-[200px]">
              {ALL_CITIES.map((c) => {
                const selected = c === city;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setActiveField(null);
                      runSearch({ city: c });
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                      selected
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-200"
                    )}
                  >
                    <span className="text-sm font-bold">{c}</span>
                    {selected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: icon -> drawer-like fullscreen */}
      <div className={cn("lg:hidden", mobileOpen && "hidden")}>
        <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 flex items-center justify-center"
          aria-label="بحث"
          title="بحث"
        >
          <Search className="w-5 h-5" />
        </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12">
                <Search className="w-4 h-4 text-orange-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      runSearch();
                    }
                  }}
                  placeholder="شنو كتقلب؟"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-zinc-400 hover:text-zinc-600"
                    aria-label="مسح"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => runSearch()}
                className="h-12 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white"
              >
                بحث
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveField((v) => (v === "category" ? null : "category"))}
                className="h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-black uppercase tracking-tight truncate">
                  {selectedCategory.label}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveField((v) => (v === "city" ? null : "city"))}
                className="h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-black uppercase tracking-tight truncate">{city}</span>
              </button>
            </div>

            {(activeField === "product" || query.trim().length >= 2) && (suggestions.length > 0 || loadingSuggestions) && (
              <div className="mt-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                {loadingSuggestions && (
                  <div className="px-4 py-3 text-sm text-zinc-500">Chargement...</div>
                )}
                {!loadingSuggestions &&
                  suggestions.map((s) => {
                    const slug = s.slug || generateSlug(s.title);
                    const href = `/ads/${s.id}/${slug}`;
                    const img = s.image_urls?.[0] || "/placeholder.png";
                    const priceText = s.price !== null && s.price !== undefined ? `${s.price} ${s.currency || "MAD"}` : "";

                    return (
                      <Link
                        key={s.id}
                        href={href}
                        onClick={() => {
                          setSuggestions([]);
                          setActiveField(null);
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          <img src={img} alt={s.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-600">
                            {s.title}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {s.city ? `${s.city} • ` : ""}
                            {priceText ? <span className="text-orange-600 font-black">{priceText}</span> : null}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-600 shrink-0" />
                      </Link>
                    );
                  })}
              </div>
            )}

            {activeField === "category" && (
              <div className="mt-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-[55vh] overflow-y-auto">
                {CATEGORIES.map((c) => {
                  const selected = c.id === categoryId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(c.id);
                        setActiveField(null);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                        selected
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-200"
                      )}
                    >
                      <span className="text-sm font-bold">{c.label}</span>
                      {selected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}

            {activeField === "city" && (
              <div className="mt-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-[55vh] overflow-y-auto">
                {ALL_CITIES.map((c) => {
                  const selected = c === city;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCity(c);
                        setActiveField(null);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                        selected
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-200"
                      )}
                    >
                      <span className="text-sm font-bold">{c}</span>
                      {selected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
