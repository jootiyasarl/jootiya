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

const ALL_CITIES = MOROCCAN_CITIES.flatMap(region => region.cities).sort();

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
            {/* Desktop Version - Ultra Compact */}
            <div className="hidden lg:flex items-center bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-full p-1 h-12 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600">
                {/* Keyword Search */}
                <div className="flex-1 flex items-center px-4 gap-2 border-r border-zinc-200 h-full">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Rechercher..."
                        className="w-full bg-transparent outline-none text-[13px] font-medium placeholder:text-zinc-400"
                    />
                </div>

                {/* Category Select - Compact */}
                <div className="relative border-r border-zinc-200 h-full flex items-center min-w-[160px]">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(prev => prev === 'category' ? null : 'category');
                        }}
                        className="flex items-center justify-between w-full h-full px-4 gap-2 text-zinc-700 hover:text-orange-600 transition-colors z-10"
                    >
                        <div className="flex items-center gap-2 overflow-hidden pointer-events-none text-xs font-bold">
                            <LayoutGrid className="w-4 h-4 text-orange-500 shrink-0" />
                            <span className="truncate">{category.label}</span>
                        </div>
                        <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform duration-300 pointer-events-none", activeMenu === 'category' && "rotate-180")} />
                    </button>
                    {activeMenu === 'category' && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-zinc-100 rounded-xl shadow-xl py-2 z-50 max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            {CATEGORIES.map((cat) => (
                                <button key={cat.id} onClick={(e) => { e.stopPropagation(); setCategory(cat); setActiveMenu(null); }}
                                    className={cn("w-full text-left px-4 py-2 text-[13px] font-medium transition-colors hover:bg-orange-50 hover:text-orange-600", category.id === cat.id ? "text-orange-600 bg-orange-50/50" : "text-zinc-600")}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location Select - Compact */}
                <div className="relative h-full flex items-center min-w-[160px]">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(prev => prev === 'location' ? null : 'location');
                        }}
                        className="flex items-center justify-between w-full h-full px-4 gap-2 text-zinc-700 hover:text-orange-600 transition-colors z-10"
                    >
                        <div className="flex items-center gap-2 overflow-hidden pointer-events-none text-xs font-bold">
                            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span className="truncate">{location === "Choisir ville - secteur" ? "Ma ville" : location}</span>
                        </div>
                        <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform duration-300 pointer-events-none", activeMenu === 'location' && "rotate-180")} />
                    </button>
                    {activeMenu === 'location' && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-zinc-100 rounded-xl shadow-xl py-2 z-50 max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            {ALL_CITIES.map((city) => (
                                <button key={city} onClick={(e) => { e.stopPropagation(); setLocation(city); setActiveMenu(null); }}
                                    className={cn("w-full text-left px-4 py-2 text-[13px] font-medium transition-colors hover:bg-orange-50 hover:text-orange-600", location === city ? "text-orange-600 bg-orange-50/50" : "text-zinc-600")}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Compact Search Button */}
                <Button
                    onClick={handleSearch}
                    className="h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 shadow-md shadow-orange-100 flex items-center gap-2 text-xs uppercase tracking-wide transition-all active:scale-[0.98] shrink-0 ml-1"
                >
                    <Search className="w-3.5 h-3.5" />
                    <span>Chercher</span>
                </Button>
            </div>

            {/* Mobile Version - Sleek & Compact */}
            <div className="lg:hidden flex flex-col gap-2">
                <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-full px-4 h-11 transition-all focus-within:bg-white focus-within:shadow-sm focus-within:border-zinc-200">
                    <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Que recherchez-vous ?"
                        className="flex-1 bg-transparent outline-none text-[13px] font-medium placeholder:text-zinc-400"
                    />
                </div>

                <div className="flex items-center gap-2 h-11">
                    <div className="relative flex-1 h-full">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(prev => prev === 'category' ? null : 'category'); }}
                            className="flex items-center justify-between w-full h-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 text-zinc-700"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <LayoutGrid className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <span className="text-[10px] font-bold uppercase tracking-tight truncate">{category.label}</span>
                            </div>
                            <ChevronDown className={cn("w-3 h-3 text-zinc-400 shrink-0 transition-transform", activeMenu === 'category' && "rotate-180")} />
                        </button>
                        {activeMenu === 'category' && (
                            <div className="absolute top-full left-0 mt-2 w-[calc(200%+8px)] bg-white border border-zinc-100 rounded-xl shadow-xl py-2 z-50 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                {CATEGORIES.map((cat) => (
                                    <button key={cat.id} onClick={(e) => { e.stopPropagation(); setCategory(cat); setActiveMenu(null); }}
                                        className={cn("w-full text-left px-4 py-2.5 text-[12px] font-bold transition-colors hover:bg-orange-50 hover:text-orange-600", category.id === cat.id ? "text-orange-600 bg-orange-50/50" : "text-zinc-600")}
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
                            className="flex items-center justify-between w-full h-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 text-zinc-700"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span className="text-[10px] font-bold uppercase tracking-tight truncate">{location === "Choisir ville - secteur" ? "Ma ville" : location}</span>
                            </div>
                            <ChevronDown className={cn("w-3 h-3 text-zinc-400 shrink-0 transition-transform", activeMenu === 'location' && "rotate-180")} />
                        </button>
                        {activeMenu === 'location' && (
                            <div className="absolute top-full right-0 mt-2 w-[calc(200%+8px)] bg-white border border-zinc-100 rounded-xl shadow-xl py-2 z-50 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                {ALL_CITIES.map((city) => (
                                    <button key={city} onClick={(e) => { e.stopPropagation(); setLocation(city); setActiveMenu(null); }}
                                        className={cn("w-full text-left px-4 py-2.5 text-[12px] font-bold transition-colors hover:bg-orange-50 hover:text-orange-600", location === city ? "text-orange-600 bg-orange-50/50" : "text-zinc-600")}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSearch}
                        className="w-12 h-full rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center p-0 min-h-[44px]"
                    >
                        <Search className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
