"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, LayoutGrid, X, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ALL_CITIES_STATIC = [
  "Toutes les villes",
  ...MOROCCAN_CITIES.flatMap((r) => r.cities).sort((a, b) => a.localeCompare(b)),
];

export function JootiyaProSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "Toutes les villes");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeField, setActiveField] = useState<null | "product" | "category" | "city">(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name");
        if (catData && catData.length > 0) {
          // Filter out categories with Arabic names — keep French/Latin only
          const frenchCategories = catData.filter(
            (c: Category) => !/[\u0600-\u06FF]/.test(c.name)
          );
          if (frenchCategories.length > 0) {
            setCategories(frenchCategories);
          } else {
            // Fallback if all categories are Arabic
            setCategories([
              { id: "electronics", name: "Électronique", slug: "electronics" },
              { id: "vehicles", name: "Véhicules", slug: "vehicles" },
              { id: "fashion", name: "Mode & Chaussures", slug: "fashion" },
              { id: "home-furniture", name: "Maison & Ameublement", slug: "home-furniture" },
              { id: "tools-equipment", name: "Outils & Équipement", slug: "tools-equipment" },
              { id: "hobbies", name: "Loisirs", slug: "hobbies" },
              { id: "animals", name: "Animaux", slug: "animals" },
              { id: "books", name: "Livres & Études", slug: "books" },
              { id: "used-clearance", name: "Occasions", slug: "used-clearance" },
            ]);
          }
        } else {
          // Fallback static categories if Supabase returns empty
          setCategories([
            { id: "electronics", name: "Électronique", slug: "electronics" },
            { id: "vehicles", name: "Véhicules", slug: "vehicles" },
            { id: "fashion", name: "Mode & Chaussures", slug: "fashion" },
            { id: "home-furniture", name: "Maison & Ameublement", slug: "home-furniture" },
            { id: "tools-equipment", name: "Outils & Équipement", slug: "tools-equipment" },
            { id: "hobbies", name: "Loisirs", slug: "hobbies" },
            { id: "animals", name: "Animaux", slug: "animals" },
            { id: "books", name: "Livres & Études", slug: "books" },
            { id: "used-clearance", name: "Occasions", slug: "used-clearance" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const selectedCategoryLabel = useMemo(() => {
    if (categoryId === "all") return "Catégories";
    return categories.find(c => c.id === categoryId)?.name || "Catégories";
  }, [categoryId, categories]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (categoryId !== "all") params.set("category", categoryId);
    if (city !== "Toutes les villes") params.set("city", city);
    
    router.push(`/marketplace/search?${params.toString()}`);
    setActiveField(null);
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll while the mobile search overlay is open
  useEffect(() => {
    if (mobileOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileOpen]);

  return (
    <div className="w-full relative z-[200]" ref={rootRef}>
      {/* Desktop Version */}
      <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_5px_20px_rgb(0,0,0,0.1)] transition-all duration-300 max-w-2xl mx-auto group/bar">
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveField(activeField === "city" ? null : "city")}
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-full transition-all duration-200 min-w-0 sm:min-w-[120px]",
              activeField === "city" 
                ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            )}
          >
            <MapPin className={cn("w-3.5 h-3.5", activeField === "city" ? "text-orange-600" : "text-zinc-400")} />
            <span className="text-xs font-bold truncate">
              {city === "Toutes les villes" ? "Ville" : city}
            </span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", activeField === "city" && "rotate-180")} />
          </button>

          {activeField === "city" && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[9999] max-h-[400px] overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Sélectionner une ville</div>
              {ALL_CITIES_STATIC.map((c) => (
                <div
                  key={c}
                  onClick={() => { setCity(c); setActiveField(null); }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all group/item",
                    city === c 
                      ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  )}
                >
                  <span className="text-sm font-bold">{c}</span>
                  {city === c && <Check className="w-4 h-4 text-orange-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        <div className="flex-1 flex items-center h-9 relative">
          <form onSubmit={handleSearch} className="flex flex-1 items-center h-full">
            <button
              type="button"
              onClick={() => setActiveField(activeField === "category" ? null : "category")}
              className={cn(
                "flex items-center gap-2 px-4 h-full rounded-full transition-all duration-200 min-w-0 sm:min-w-[130px]",
                activeField === "category" 
                  ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
              )}
            >
              <LayoutGrid className={cn("w-3.5 h-3.5", activeField === "category" ? "text-orange-600" : "text-zinc-400")} />
              <span className="text-xs font-bold truncate max-w-[90px]">
                {selectedCategoryLabel}
              </span>
              <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", activeField === "category" && "rotate-180")} />
            </button>

            <div className="flex-1 flex items-center px-3 h-full">
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setActiveField("product")}
                className="w-full bg-transparent outline-none text-xs font-bold text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 h-full"
              />
            </div>

            <div className="pr-1">
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 rounded-full h-8 w-8 p-0 flex items-center justify-center shrink-0 transition-all duration-300 active:scale-90 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 group/btn"
              >
                <Search className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
              </Button>
            </div>
          </form>

          {activeField === "category" && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[9999] max-h-[400px] overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Toutes les catégories</div>
              <div
                onClick={() => { setCategoryId("all"); setActiveField(null); }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all group/item",
                  categoryId === "all" 
                    ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                )}
              >
                <span className="text-sm font-bold">Toutes les catégories</span>
                {categoryId === "all" && <Check className="w-4 h-4 text-orange-600" />}
              </div>
              {categories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setCategoryId(c.id); setActiveField(null); }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all group/item",
                    categoryId === c.id 
                      ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  )}
                >
                  <span className="text-sm font-bold">{c.name}</span>
                  {categoryId === c.id && <Check className="w-4 h-4 text-orange-600" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Version */}
      <div className="lg:hidden w-full">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center gap-2 h-9 min-[360px]:h-10 pl-3 pr-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 shadow-sm transition-all active:scale-[0.99]"
          aria-label="Rechercher"
        >
          <Search className="w-4 h-4 shrink-0 text-zinc-400" />
          <span className="flex-1 text-left text-xs min-[360px]:text-sm font-medium truncate">
            Rechercher un article...
          </span>
          <span className="flex items-center justify-center w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 rounded-full bg-orange-500 text-white shrink-0">
            <Search className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4" />
          </span>
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 p-3 min-[360px]:p-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 min-[360px]:mb-6 shrink-0">
              <h2 className="text-lg min-[360px]:text-xl font-black">Recherche</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 min-[360px]:gap-4 min-h-0 overflow-y-auto">
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 shrink-0">
                <Search className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 text-orange-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Que recherchez-vous ?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full min-w-0 bg-transparent outline-none font-bold text-base"
                  style={{ fontSize: "16px" }}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div 
                  onClick={() => setActiveField(activeField === "category" ? null : "category")}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-zinc-400" />
                    <span className="text-sm font-bold">{selectedCategoryLabel}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </div>

                {activeField === "category" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-h-48 overflow-y-auto p-2">
                    <div
                      onClick={() => { setCategoryId("all"); setActiveField(null); }}
                      className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium"
                    >
                      Toutes les catégories
                    </div>
                    {categories.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => { setCategoryId(c.id); setActiveField(null); }}
                        className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium"
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}

                <div 
                  onClick={() => setActiveField(activeField === "city" ? null : "city")}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    <span className="text-sm font-bold">{city}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </div>

                {activeField === "city" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-h-48 overflow-y-auto p-2">
                    {ALL_CITIES_STATIC.map((c) => (
                      <div
                        key={c}
                        onClick={() => { setCity(c); setActiveField(null); }}
                        className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-12 min-[360px]:h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-base min-[360px]:text-lg shadow-xl shadow-orange-600/20 mt-2 min-[360px]:mt-4 shrink-0">
                بحث الآن
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
