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

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);

    const categoryRef = useRef<HTMLDivElement>(null);
    const locationRef = useRef<HTMLDivElement>(null);

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
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setIsLocationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            {/* Desktop Version */}
            <div className="hidden lg:flex items-center bg-white border border-zinc-200 rounded-full shadow-lg shadow-zinc-200/50 p-1.5 h-16">
                {/* Keyword Search */}
                <div className="flex-1 flex items-center px-4 gap-3 border-r border-zinc-100 h-full">
                    <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Que recherchez-vous ?"
                        className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-zinc-400"
                    />
                </div>

                {/* Category Select */}
                <div className="relative border-r border-zinc-100 h-full flex items-center min-w-[220px]" ref={categoryRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setIsCategoryOpen(!isCategoryOpen);
                            setIsLocationOpen(false);
                        }}
                        className="flex items-center justify-between w-full h-full px-6 gap-3 text-zinc-700 hover:text-orange-600 transition-colors"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <LayoutGrid className="w-5 h-5 text-orange-500 shrink-0" />
                            <span className="text-[14px] font-bold truncate">{category.label}</span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-300", isCategoryOpen && "rotate-180")} />
                    </button>

                    {isCategoryOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-100 rounded-2xl shadow-2xl py-2 z-50 max-h-[400px] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setCategory(cat);
                                        setIsCategoryOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-orange-50 hover:text-orange-600",
                                        category.id === cat.id ? "text-orange-600 bg-orange-50/50" : "text-zinc-600"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location Select */}
                <div className="relative h-full flex items-center min-w-[240px]" ref={locationRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setIsLocationOpen(!isLocationOpen);
                            setIsCategoryOpen(false);
                        }}
                        className="flex items-center justify-between w-full h-full px-6 gap-3 text-zinc-700 hover:text-orange-600 transition-colors"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center shrink-0">
                                <MapPin className="w-4.5 h-4.5 text-zinc-900" />
                            </div>
                            <span className="text-[14px] font-bold truncate">{location}</span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-300", isLocationOpen && "rotate-180")} />
                    </button>

                    {isLocationOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-zinc-100 rounded-2xl shadow-2xl py-2 z-50 max-h-[400px] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 border-b border-zinc-50 mb-1">
                                <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Villes du Maroc</p>
                            </div>
                            <button
                                onClick={() => {
                                    setLocation("Toutes les villes");
                                    setIsLocationOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-[14px] font-bold text-orange-600 hover:bg-orange-50"
                            >
                                Toutes les villes
                            </button>
                            {ALL_CITIES.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => {
                                        setLocation(city);
                                        setIsLocationOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-orange-50 hover:text-orange-600",
                                        location === city ? "text-orange-600 bg-orange-50/50" : "text-zinc-600"
                                    )}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Button */}
                <Button
                    onClick={handleSearch}
                    className="h-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black px-10 shadow-lg shadow-orange-200/50 flex items-center gap-2 text-base transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                    <Search className="w-5 h-5" />
                    Rechercher
                </Button>
            </div>

            {/* Mobile Version */}
            <div className="lg:hidden flex flex-col gap-2.5">
                {/* Search Input */}
                <div className="flex items-center bg-white border border-zinc-200 rounded-2xl shadow-sm px-4 h-12">
                    <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Que recherchez-vous ?"
                        className="flex-1 bg-transparent outline-none text-[13px] font-bold placeholder:text-zinc-400"
                    />
                </div>

                {/* Selects Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Category Dropdown Mobile */}
                    <div className="relative" ref={categoryRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCategoryOpen(!isCategoryOpen);
                                setIsLocationOpen(false);
                            }}
                            className="flex items-center justify-between w-full bg-white border border-zinc-200 rounded-xl px-3 h-10 text-zinc-700"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <LayoutGrid className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-tight truncate">{category.label}</span>
                            </div>
                            <ChevronDown className={cn("w-3 h-3 text-zinc-400 shrink-0 transition-transform", isCategoryOpen && "rotate-180")} />
                        </button>
                        {isCategoryOpen && (
                            <div className="absolute top-full left-0 mt-1 w-[calc(200%+8px)] bg-white border border-zinc-100 rounded-xl shadow-xl py-2 z-[60] max-h-64 overflow-y-auto">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setCategory(cat);
                                            setIsCategoryOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-zinc-600 active:bg-orange-50 uppercase tracking-tight"
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location Dropdown Mobile */}
                    <div className="relative" ref={locationRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLocationOpen(!isLocationOpen);
                                setIsCategoryOpen(false);
                            }}
                            className="flex items-center justify-between w-full bg-white border border-zinc-200 rounded-xl px-3 h-10 text-zinc-700"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-tight truncate">{location === "Choisir ville - secteur" ? "Ma ville" : location}</span>
                            </div>
                            <ChevronDown className={cn("w-3 h-3 text-zinc-400 shrink-0 transition-transform", isLocationOpen && "rotate-180")} />
                        </button>
                        {isLocationOpen && (
                            <div className="absolute top-full right-0 mt-1 w-[calc(200%+8px)] bg-white border border-zinc-100 rounded-xl shadow-xl py-2 z-[60] max-h-64 overflow-y-auto">
                                {ALL_CITIES.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => {
                                            setLocation(city);
                                            setIsLocationOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-zinc-600 active:bg-orange-50 uppercase tracking-tight"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Button */}
                <Button
                    onClick={handleSearch}
                    className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-all uppercase italic tracking-wider"
                >
                    <Search className="w-4 h-4" />
                    Rechercher
                </Button>
            </div>
        </div>
    );
}
