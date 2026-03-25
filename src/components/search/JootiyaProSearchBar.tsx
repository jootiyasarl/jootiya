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
    <div className="w-full relative z-[100]" ref={rootRef}>
      {/* Desktop Version */}
      <div className="hidden lg:flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-3xl mx-auto">
        {/* City Filter - Pill Shape */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveField(activeField === "city" ? null : "city")}
            className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-zinc-900 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm min-w-[120px] border border-transparent hover:border-zinc-200"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate">
              {city === "Toutes les villes" ? "Ville" : city}
            </span>
          </button>

          {/* City Dropdown */}
          {activeField === "city" && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[9999] max-h-80 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {ALL_CITIES.map((c) => (
                <div
                  key={c}
                  onClick={() => { setCity(c); setActiveField(null); }}
                  className="flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer group"
                >
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-orange-600 transition-colors">{c}</span>
                  {city === c && <Check className="w-3.5 h-3.5 text-orange-600" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Main Bar - Integrated Pill */}
        <div className="flex-1 flex items-center bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-transparent hover:border-zinc-200 transition-all h-10 relative">
          <form 
            onSubmit={handleSearch} 
            className="flex flex-1 items-center h-full"
          >
            {/* Category Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setActiveField(activeField === "category" ? null : "category")}
              className="flex items-center gap-2 px-4 h-full border-r border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors min-w-[120px]"
            >
              <span className="text-xs font-black text-zinc-700 dark:text-zinc-200 truncate max-w-[100px] uppercase tracking-tight">
                {selectedCategory.id === "all" ? "Categories" : selectedCategory.label}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform", activeField === "category" && "rotate-180")} />
            </button>

            {/* Input Field */}
            <div className="flex-1 flex items-center px-4 h-full">
              <input
                type="text"
                placeholder="Search any item..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setActiveField("product")}
                className="w-full bg-transparent outline-none text-xs font-bold text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 h-full"
              />
            </div>

            {/* Search Action Button */}
            <div className="pr-1">
              <Button 
                type="submit" 
                size="icon" 
                className="bg-[#2DB4B4] hover:bg-[#259797] rounded-full h-8 w-8 shrink-0 transition-transform active:scale-95 shadow-md shadow-[#2DB4B4]/20"
              >
                <Search className="w-4 h-4 text-white" />
              </Button>
            </div>
          </form>

          {/* Categories Dropdown Content */}
          {activeField === "category" && (
            <div className="absolute top-full left-0 w-64 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-[9999] max-h-80 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setCategoryId(c.id); setActiveField(null); }}
                  className="flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer group"
                >
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-orange-600 transition-colors">{c.label}</span>
                  {categoryId === c.id && <Check className="w-3.5 h-3.5 text-orange-600" />}
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