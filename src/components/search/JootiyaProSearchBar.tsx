"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, LayoutGrid, X, Check, ChevronRight } from "lucide-react";
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
    
    router.push(`/marketplace?${params.toString()}`);
    setActiveField(null);
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
    <div className="w-full relative" ref={rootRef}>
      <form onSubmit={handleSearch} className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-1.5 gap-1">
        {/* Input Field */}
        <div className="flex-[2] flex items-center px-3 border-r border-zinc-100 dark:border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400 mr-2" />
          <input
            type="text"
            placeholder="شنو كتقلب"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setActiveField("product")}
            className="w-full bg-transparent outline-none text-sm py-2"
          />
        </div>

        {/* Category Selector */}
        <div 
          onClick={() => setActiveField(activeField === "category" ? null : "category")}
          className="flex-1 flex items-center px-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl py-2 border-r border-zinc-100 dark:border-zinc-800"
        >
          <LayoutGrid className="w-4 h-4 text-zinc-400 mr-2" />
          <span className="text-xs font-bold truncate">{selectedCategory.label}</span>
        </div>

        {/* City Selector */}
        <div 
          onClick={() => setActiveField(activeField === "city" ? null : "city")}
          className="flex-1 flex items-center px-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl py-2"
        >
          <MapPin className="w-4 h-4 text-zinc-400 mr-2" />
          <span className="text-xs font-bold truncate">{city}</span>
        </div>

        {/* Action Button */}
        <Button type="submit" size="icon" className="bg-orange-600 hover:bg-orange-700 rounded-xl shrink-0">
          <Search className="w-4 h-4 text-white" />
        </Button>
      </form>

      {/* Dropdowns */}
      {activeField === "category" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-[999] max-h-60 overflow-y-auto p-2">
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              onClick={() => { setCategoryId(c.id); setActiveField(null); }}
              className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              <span className="text-sm">{c.label}</span>
              {categoryId === c.id && <Check className="w-4 h-4 text-orange-600" />}
            </div>
          ))}
        </div>
      )}

      {activeField === "city" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-[999] max-h-60 overflow-y-auto p-2">
          {ALL_CITIES.map((c) => (
            <div
              key={c}
              onClick={() => { setCity(c); setActiveField(null); }}
              className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              <span className="text-sm">{c}</span>
              {city === c && <Check className="w-4 h-4 text-orange-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}