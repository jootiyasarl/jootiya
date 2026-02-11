"use client";

import { Search, MapPin, ChevronDown, LayoutGrid, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";
import { useRouter } from "next/navigation";

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
];

const ALL_CITIES = ["Toutes les villes", ...MOROCCAN_CITIES.flatMap(region => region.cities).sort()];

export function UnifiedSearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [location, setLocation] = useState("Choisir ville - secteur");

    const [activeMenu, setActiveMenu] = useState<'category' | 'location' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category.id !== "all") params.set("category", category.id);
        if (location !== "Choisir ville - secteur" && location !== "Toutes les villes") {
            params.set("city", location);
        }

        router.push(`/marketplace?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full" ref={containerRef}>
            {/* Desktop Version - Refined & Compact Pill */}
            <div className="flex items-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/20 rounded-full p-1 h-12 transition-all shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:shadow-md hover:bg-white dark:hover:bg-zinc-900">
                {/* Keyword Search */}
                <div className="flex-[1.2] flex items-center px-4 gap-2.5 min-w-0">
                    <Search className="w-4 h-4 text-orange-500/70 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Rechercher..."
                        className="w-full bg-transparent outline-none text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 placeholder:font-medium"
                    />
                </div>

                {/* Separator */}
                <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 shrink-0" />

                {/* Category Select */}
                <div className="relative h-full flex items-center min-w-[150px]">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(prev => prev === 'category' ? null : 'category');
                        }}
                        className="flex items-center justify-between w-full h-full px-4 gap-2 text-zinc-700 dark:text-zinc-300 hover:text-orange-600 transition-colors z-10"
                    >
                        <div className="flex items-center gap-2 overflow-hidden pointer-events-none text-[10px] font-black uppercase tracking-wider">
                            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{category.label}</span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 pointer-events-none", activeMenu === 'category' && "rotate-180")} />
                    </button>
                    {activeMenu === 'category' && (
                        <div className="absolute top-full left-0 mt-3 w-60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            {CATEGORIES.map((cat) => (
                                <button key={cat.id} onClick={(e) => { e.stopPropagation(); setCategory(cat); setActiveMenu(null); }}
                                    className={cn("w-full text-left px-5 py-2 text-[12px] font-bold transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600", category.id === cat.id ? "text-orange-600 bg-orange-50/50 dark:bg-orange-900/30 font-black" : "text-zinc-600 dark:text-zinc-400")}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Separator */}
                <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 shrink-0" />

                {/* Location Select */}
                <div className="relative h-full flex items-center min-w-[150px]">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(prev => prev === 'location' ? null : 'location');
                        }}
                        className="flex items-center justify-between w-full h-full px-4 gap-2 text-zinc-700 dark:text-zinc-300 hover:text-orange-600 transition-colors z-10"
                    >
                        <div className="flex items-center gap-2 overflow-hidden pointer-events-none text-[10px] font-black uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{location === "Choisir ville - secteur" ? "Ma ville" : location}</span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 pointer-events-none", activeMenu === 'location' && "rotate-180")} />
                    </button>
                    {activeMenu === 'location' && (
                        <div className="absolute top-full right-0 mt-3 w-60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            {ALL_CITIES.map((city) => (
                                <button key={city} onClick={(e) => { e.stopPropagation(); setLocation(city); setActiveMenu(null); }}
                                    className={cn("w-full text-left px-5 py-2 text-[12px] font-bold transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600", location === city ? "text-orange-600 bg-orange-50/50 dark:bg-orange-900/30 font-black" : "text-zinc-600 dark:text-zinc-400")}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Refined Search Button */}
                <Button
                    onClick={handleSearch}
                    className="h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black px-6 shadow-md shadow-orange-500/10 flex items-center gap-2 text-[10px] uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.97] shrink-0 ml-1"
                >
                    <Search className="w-3.5 h-3.5" />
                    <span>Chercher</span>
                </Button>
            </div>

            {/* Mobile Version - Sleek & Premium */}
            <div className="lg:hidden flex flex-col gap-3">
                <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 h-12 transition-all shadow-sm focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:shadow-md focus-within:ring-2 focus-within:ring-orange-500/20">
                    <Search className="w-4 h-4 text-orange-500 mr-3 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Que recherchez-vous ?"
                        className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 placeholder:font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 h-12">
                    <div className="relative flex-1 h-full">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(prev => prev === 'category' ? null : 'category'); }}
                            className="flex items-center justify-between w-full h-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-zinc-700 dark:text-zinc-300 shadow-sm"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <LayoutGrid className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-tight truncate">{category.label}</span>
                            </div>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform", activeMenu === 'category' && "rotate-180")} />
                        </button>
                        {activeMenu === 'category' && (
                            <div className="absolute top-full left-0 mt-2 w-[calc(200%+8px)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                {CATEGORIES.map((cat) => (
                                    <button key={cat.id} onClick={(e) => { e.stopPropagation(); setCategory(cat); setActiveMenu(null); }}
                                        className={cn("w-full text-left px-5 py-3 text-[13px] font-bold transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600", category.id === cat.id ? "text-orange-600 bg-orange-50/50 dark:bg-orange-900/30 font-black" : "text-zinc-600 dark:text-zinc-400")}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative flex-1 h-full">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(prev => prev === 'location' ? null : 'location'); }}
                            className="flex items-center justify-between w-full h-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-zinc-700 dark:text-zinc-300 shadow-sm"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-tight truncate">{location === "Choisir ville - secteur" ? "Ma ville" : location}</span>
                            </div>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform", activeMenu === 'location' && "rotate-180")} />
                        </button>
                        {activeMenu === 'location' && (
                            <div className="absolute top-full right-0 mt-2 w-[calc(200%+8px)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                {ALL_CITIES.map((city) => (
                                    <button key={city} onClick={(e) => { e.stopPropagation(); setLocation(city); setActiveMenu(null); }}
                                        className={cn("w-full text-left px-5 py-3 text-[13px] font-bold transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600", location === city ? "text-orange-600 bg-orange-50/50 dark:bg-orange-900/30 font-black" : "text-zinc-600 dark:text-zinc-400")}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSearch}
                        className="w-14 h-full rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center justify-center p-0 shadow-lg shadow-orange-500/20 active:scale-95 transition-all border border-orange-400/20"
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
