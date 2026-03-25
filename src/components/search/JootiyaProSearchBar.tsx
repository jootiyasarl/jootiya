"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, LayoutGrid, X, Check, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";
import { supabase } from "@/lib/supabaseClient";
import { generateSlug } from "@/lib/seo-utils";
import Link from "next/link";

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

export function JootiyaProSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [city, setCity] = useState("Toutes les villes");
  const [activeField, setActiveField] = useState<null | "product" | "category" | "city">(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0],
    [categoryId]
  );

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

  return (
    <div className="w-full relative z-[200]" ref={rootRef}>
      {/* Desktop Version */}
      <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 max-w-3xl mx-auto group/bar">
        {/* City Filter - Professional Minimalist */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveField(activeField === "city" ? null : "city")}
            className={cn(
              "flex items-center gap-2 h-11 px-5 rounded-full transition-all duration-200 min-w-[140px]",
              activeField === "city" 
                ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            )}
          >
            <MapPin className={cn("w-4 h-4", activeField === "city" ? "text-orange-600" : "text-zinc-400")} />
            <span className="text-sm font-bold truncate">
              {city === "Toutes les villes" ? "Ville" : city}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeField === "city" && "rotate-180")} />
          </button>

          {/* City Dropdown - Elevated Glassmorphism */}
          {activeField === "city" && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[9999] max-h-[400px] overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Sélectionner une ville</div>
              {ALL_CITIES.map((c) => (
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

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Search Main Bar - Seamless Integration */}
        <div className="flex-1 flex items-center h-11 relative">
          <form 
            onSubmit={handleSearch} 
            className="flex flex-1 items-center h-full"
          >
            {/* Category Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setActiveField(activeField === "category" ? null : "category")}
              className={cn(
                "flex items-center gap-2 px-5 h-full rounded-full transition-all duration-200 min-w-[150px]",
                activeField === "category" 
                  ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" 
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
              )}
            >
              <LayoutGrid className={cn("w-4 h-4", activeField === "category" ? "text-orange-600" : "text-zinc-400")} />
              <span className="text-sm font-bold truncate max-w-[110px]">
                {selectedCategory.id === "all" ? "Catégories" : selectedCategory.label}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeField === "category" && "rotate-180")} />
            </button>

            {/* Input Field */}
            <div className="flex-1 flex items-center px-4 h-full">
              <input
                type="text"
                placeholder="Search any item..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setActiveField("product")}
                className="w-full bg-transparent outline-none text-sm font-bold text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 h-full"
              />
            </div>

            {/* Search Action Button - Iconic */}
            <div className="pr-1">
              <Button 
                type="submit" 
                className="bg-[#2DB4B4] hover:bg-[#259797] rounded-full h-10 w-10 p-0 flex items-center justify-center shrink-0 transition-all duration-300 active:scale-90 shadow-lg shadow-[#2DB4B4]/30 hover:shadow-[#2DB4B4]/50 group/btn"
              >
                <Search className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
              </Button>
            </div>
          </form>

          {/* Categories Dropdown Content - Elevated Glassmorphism */}
          {activeField === "category" && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[9999] max-h-[400px] overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Toutes les catégories</div>
              {CATEGORIES.map((c) => (
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
                  <span className="text-sm font-bold">{c.label}</span>
                  {categoryId === c.id && <Check className="w-4 h-4 text-orange-600" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Version */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-orange-500 rounded-xl text-white shadow-lg"
        >
          <Search className="w-5 h-5" />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">Recherche</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <Search className="w-5 h-5 text-orange-500" />
                <input
                  type="text"
                  placeholder="شنو كتقلب؟"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent outline-none font-bold"
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
                    <span className="text-sm font-bold">{selectedCategory.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </div>

                {activeField === "category" && (
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-h-48 overflow-y-auto p-2">
                    {CATEGORIES.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => { setCategoryId(c.id); setActiveField(null); }}
                        className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium"
                      >
                        {c.label}
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
                    {ALL_CITIES.map((c) => (
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

              <Button type="submit" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-600/20 mt-4">
                بحث الآن
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}