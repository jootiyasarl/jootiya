"use client";

import { Search, MapPin, ChevronDown, LayoutGrid, X, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

const CATEGORIES = [
    { id: "all", label: "Toutes les catégories", icon: LayoutGrid },
    { id: "electronics", label: "Électronique", icon: LayoutGrid },
    { id: "home-furniture", label: "Maison & Ameublement", icon: LayoutGrid },
    { id: "vehicles", label: "Véhicules & Transport", icon: LayoutGrid },
    { id: "fashion", label: "Mode & Chaussures", icon: LayoutGrid },
    { id: "tools-equipment", label: "Outils & Équipement", icon: LayoutGrid },
    { id: "hobbies", label: "Loisirs & Divertissement", icon: LayoutGrid },
    { id: "animals", label: "Animaux", icon: LayoutGrid },
    { id: "books", label: "Livres & Études", icon: LayoutGrid },
    { id: "used-clearance", label: "Occasions / Vide-grenier", icon: LayoutGrid },
    { id: "other", label: "Autres", icon: LayoutGrid },
];

const ALL_CITIES = ["Toutes les villes", ...MOROCCAN_CITIES.flatMap(region => region.cities).sort()];

function SearchPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted ? createPortal(children, document.body) : null;
}

export function UnifiedSearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [location, setLocation] = useState("Toutes les villes");

    const [activeMenu, setActiveMenu] = useState<'category' | 'location' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const normalizeKey = (s: string) =>
        s
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    const detectExactCity = (q: string): string | null => {
        const trimmed = q.trim();
        if (!trimmed) return null;
        const qLower = normalizeKey(trimmed);
        const allCities = MOROCCAN_CITIES.flatMap((r) => r.cities);
        const exact = allCities.find((c) => typeof c === "string" && normalizeKey(c) === qLower);
        return exact || null;
    };

    const detectExactCategory = (q: string): { id: string; label: string } | null => {
        const trimmed = q.trim();
        if (!trimmed) return null;
        const qLower = normalizeKey(trimmed);
        const exact = CATEGORIES.find((c) => c.id !== "all" && normalizeKey(c.label) === qLower);
        return exact ? { id: exact.id, label: exact.label } : null;
    };

    const autoTags = (() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) return [] as string[];

        const base = suggestions
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 3);

        const extra: string[] = [];
        if (category.id !== "all") extra.push(trimmed + " " + category.id);
        if (location !== "Toutes les villes") extra.push(trimmed + " " + location);

        const qLower = normalizeKey(trimmed);
        const allCities = MOROCCAN_CITIES.flatMap((r) => r.cities);
        const cityMatch = allCities
            .find((c) => typeof c === "string" && normalizeKey(c).startsWith(qLower));
        if (cityMatch) {
            extra.unshift(cityMatch);
        }

        const categoryMatch = CATEGORIES.find((c) => c.id !== "all" && normalizeKey(c.label).startsWith(qLower));
        if (categoryMatch) {
            extra.unshift(categoryMatch.label);
        }

        const tags = [...base, ...extra]
            .map((t) => t.replace(/\s+/g, " ").trim())
            .filter(Boolean)
            .slice(0, 4);

        return tags;
    })();

    // Fetch suggestions from Supabase
    useEffect(() => {
        const fetchSuggestions = async () => {
            const trimmedQuery = query.trim();
            if (trimmedQuery.length < 1) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            // Simplified query to ensure data is returned
            const { data, error } = await supabase
                .from("ads")
                .select("title")
                .ilike("title", `%${trimmedQuery}%`)
                .limit(20);

            if (error) {
                console.error("DEBUG: Suggestion fetch error:", error);
                return;
            }

            if (data && data.length > 0) {
                const uniqueTitles = Array.from(new Set(data.map((item: any) => item.title))) as string[];
                
                const sortedTitles = uniqueTitles.sort((a, b) => {
                    const aLower = a.toLowerCase();
                    const bLower = b.toLowerCase();
                    const qLower = trimmedQuery.toLowerCase();
                    const aStarts = aLower.startsWith(qLower);
                    const bStarts = bLower.startsWith(qLower);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    return a.length - b.length;
                }).slice(0, 6);

                setSuggestions(sortedTitles);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 50);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (overrideQuery?: string | React.MouseEvent, overrideLocation?: string) => {
        // If it's a click event, overrideQuery will be the event object
        const finalQuery = typeof overrideQuery === 'string' ? overrideQuery : query;
        const trimmedQuery = finalQuery.trim();
        const currentLocation = overrideLocation || location;
        
        // Case 1: Only Category is selected (SEO Path)
        if (category.id !== "all" && !trimmedQuery && currentLocation === "Toutes les villes") {
            router.push(`/marketplace/category/${category.id}`);
            setActiveMenu(null);
            setShowSuggestions(false);
            return;
        }

        // Case 2: Only City is selected (SEO Path)
        if (currentLocation !== "Toutes les villes" && !trimmedQuery && category.id === "all") {
            router.push(`/cities/${currentLocation.toLowerCase()}`);
            setActiveMenu(null);
            setShowSuggestions(false);
            return;
        }

        // Case 3: Mixed search (General Search with params)
        const params = new URLSearchParams();
        if (trimmedQuery) params.set("q", trimmedQuery);
        if (category.id !== "all") params.set("category", category.id);
        if (currentLocation !== "Toutes les villes") {
            params.set("city", currentLocation);
        }

        const queryString = params.toString();
        router.push(`/marketplace${queryString ? `?${queryString}` : ""}`);
        setActiveMenu(null);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const exactCategory = detectExactCategory(query);
            if (exactCategory) {
                router.push(`/marketplace/category/${exactCategory.id}`);
                setActiveMenu(null);
                setShowSuggestions(false);
                return;
            }
            const exactCity = detectExactCity(query);
            if (exactCity) {
                router.push(`/cities/${exactCity.toLowerCase()}`);
                setActiveMenu(null);
                setShowSuggestions(false);
                return;
            }
            handleSearch();
        }
    };

    // Prevent scrolling when mobile modal is open
    useEffect(() => {
        if (activeMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [activeMenu]);

    return (
        <div className="w-full" ref={containerRef}>
            {/* Desktop Version - Refined & Compact Pill */}
            <div className="hidden lg:flex items-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/20 rounded-full p-1 h-12 transition-all shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:shadow-md hover:bg-white dark:hover:bg-zinc-900">
                {/* Keyword Search */}
                <div className="flex-[2] flex items-center px-4 gap-2.5 min-w-0 relative" ref={suggestionRef}>
                    <Search className="w-4 h-4 text-orange-500/70 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Que recherchez-vous ?"
                        className="w-full bg-transparent outline-none text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 placeholder:font-medium"
                    />

                    <AnimatePresence>
                        {autoTags.length > 0 && query.trim().length >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.16 }}
                                className="absolute top-full left-0 right-0 mt-2 flex flex-wrap gap-2 z-[55]"
                            >
                                {autoTags.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const exactCategory = detectExactCategory(t);
                                            if (exactCategory) {
                                                setQuery(exactCategory.label);
                                                setShowSuggestions(false);
                                                router.push(`/marketplace/category/${exactCategory.id}`);
                                                setActiveMenu(null);
                                                return;
                                            }
                                            const exactCity = detectExactCity(t);
                                            if (exactCity) {
                                                setQuery(exactCity);
                                                setShowSuggestions(false);
                                                router.push(`/cities/${exactCity.toLowerCase()}`);
                                                setActiveMenu(null);
                                                return;
                                            }

                                            setQuery(t);
                                            setShowSuggestions(false);
                                            handleSearch(t);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-zinc-800 text-orange-500 text-[11px] font-black tracking-tight hover:bg-zinc-700 transition-colors"
                                    >
                                        #{t.replace(/\s+/g, "_")}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-[60] overflow-hidden"
                            >
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setQuery(suggestion);
                                            setShowSuggestions(false);
                                            handleSearch(suggestion);
                                        }}
                                        className="w-full text-left px-5 py-2.5 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 flex items-center gap-3"
                                    >
                                        <Search className="w-3.5 h-3.5 opacity-40" />
                                        <span className="truncate">{suggestion}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                            <LayoutGrid className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                            <span className="truncate">{category.label}</span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-300 pointer-events-none", activeMenu === 'category' && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                        {activeMenu === 'category' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 max-h-[400px] overflow-y-auto"
                            >
                                {CATEGORIES.map((cat) => (
                                    <button key={cat.id} onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setCategory(cat); 
                                        setActiveMenu(null);
                                        // Trigger search when category changes if no query
                                        if (!query.trim()) {
                                            const params = new URLSearchParams();
                                            if (cat.id !== "all") params.set("category", cat.id);
                                            if (location !== "Toutes les villes") params.set("city", location);
                                            router.push(cat.id !== "all" && location === "Toutes les villes" ? `/categories/${cat.id}` : `/marketplace?${params.toString()}`);
                                        }
                                    }}
                                        className={cn("w-full text-left px-5 py-2.5 text-[12px] font-bold transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 flex items-center justify-between", category.id === cat.id ? "text-orange-600 bg-orange-50/50 dark:bg-orange-900/30 font-black" : "text-zinc-600 dark:text-zinc-400")}
                                    >
                                        {cat.label}
                                        {category.id === cat.id && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                            <span className="truncate">{location}</span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-300 pointer-events-none", activeMenu === 'location' && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                        {activeMenu === 'location' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 max-h-[400px] overflow-y-auto"
                            >
                                {ALL_CITIES.map((city) => (
                                    <button key={city} onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setLocation(city); 
                                        setActiveMenu(null); 
                                        // Trigger search when city changes
                                        if (!query.trim()) {
                                            if (city === "Toutes les villes") {
                                                router.push(category.id === "all" ? "/marketplace" : `/categories/${category.id}`);
                                            } else {
                                                router.push(category.id === "all" ? `/cities/${city.toLowerCase()}` : `/marketplace?category=${category.id}&city=${city}`);
                                            }
                                        }
                                    }}
                                        className={cn("w-full text-left px-5 py-2.5 text-[12px] font-bold transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 flex items-center justify-between", location === city ? "text-orange-600 bg-orange-50/50 dark:bg-orange-900/30 font-black" : "text-zinc-600 dark:text-zinc-400")}
                                    >
                                        {city}
                                        {location === city && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Refined Search Button */}
                <Button
                    onClick={handleSearch}
                    className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black p-0 shadow-md shadow-orange-500/10 flex items-center justify-center transition-all hover:scale-[1.03] active:scale-[0.97] shrink-0 ml-1"
                >
                    <Search className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile Version - Sleek & Premium Search Bar */}
            <div className="flex flex-col gap-2.5 lg:hidden relative" ref={suggestionRef}>
                {/* Main Search Input */}
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-orange-500" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Que recherchez-vous ?"
                        className="w-full h-[52px] pl-11 pr-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 placeholder:font-medium focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                    />
                </div>

                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-[56px] left-0 right-0 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-2xl py-2 z-[60] overflow-hidden"
                        >
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setQuery(suggestion);
                                        setShowSuggestions(false);
                                        handleSearch(suggestion);
                                    }}
                                    className="w-full text-left px-5 py-3.5 text-[13px] font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-orange-600 flex items-center gap-3"
                                >
                                    <Search className="w-4 h-4 opacity-40" />
                                    <span className="truncate">{suggestion}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filters Row */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveMenu('category')}
                        className={cn(
                            "flex-1 h-11 flex items-center gap-2 px-4 rounded-xl border transition-all",
                            category.id !== "all" 
                                ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400" 
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400"
                        )}
                    >
                        <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-tight truncate">
                            {category.id === "all" ? "Catégorie" : category.label}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-40" />
                    </button>

                    <button
                        onClick={() => setActiveMenu('location')}
                        className={cn(
                            "flex-1 h-11 flex items-center gap-2 px-4 rounded-xl border transition-all",
                            location !== "Toutes les villes" 
                                ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400" 
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400"
                        )}
                    >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-tight truncate">
                            {location === "Toutes les villes" ? "Ville" : location}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-40" />
                    </button>

                    <Button
                        onClick={handleSearch}
                        className="w-12 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 border-b-2 border-orange-700 active:border-b-0 active:translate-y-0.5 transition-all p-0 flex items-center justify-center shrink-0"
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Mobile Selection Modals */}
            <SearchPortal>
                <AnimatePresence>
                    {activeMenu && (
                        <div className="fixed inset-0 z-[1000] lg:hidden">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveMenu(null)}
                                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                            />
                            
                            {/* Content Modal */}
                            <motion.div 
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-10">
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                                            {activeMenu === 'category' ? "Sélectionner Catégorie" : "Sélectionner Ville"}
                                        </h3>
                                        <p className="text-sm text-zinc-500 font-medium">Faites votre choix pour filtrer</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveMenu(null)}
                                        className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Options List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-1 pb-10">
                                    {(activeMenu === 'category' ? CATEGORIES : ALL_CITIES).map((item: any) => {
                                        const isSelected = activeMenu === 'category' 
                                            ? category.id === item.id 
                                            : location === item;
                                        
                                        return (
                                            <button
                                                key={typeof item === 'string' ? item : item.id}
                                                onClick={() => {
                                                    if (activeMenu === 'category') {
                                                        setCategory(item);
                                                        if (!query.trim()) {
                                                            const params = new URLSearchParams();
                                                            if (item.id !== "all") params.set("category", item.id);
                                                            if (location !== "Toutes les villes") params.set("city", location);
                                                            router.push(item.id !== "all" && location === "Toutes les villes" ? `/categories/${item.id}` : `/marketplace?${params.toString()}`);
                                                        }
                                                    } else {
                                                        setLocation(item);
                                                        if (!query.trim()) {
                                                            if (item === "Toutes les villes") {
                                                                router.push(category.id === "all" ? "/marketplace" : `/categories/${category.id}`);
                                                            } else {
                                                                router.push(category.id === "all" ? `/cities/${item.toLowerCase()}` : `/marketplace?category=${category.id}&city=${item}`);
                                                            }
                                                        }
                                                    }
                                                    setActiveMenu(null);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all",
                                                    isSelected 
                                                        ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black shadow-sm ring-1 ring-orange-200 dark:ring-orange-500/20" 
                                                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {activeMenu === 'category' ? (
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                            isSelected ? "bg-orange-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                                        )}>
                                                            <LayoutGrid className="w-5 h-5" />
                                                        </div>
                                                    ) : (
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                            isSelected ? "bg-orange-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                                        )}>
                                                            <MapPin className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <span>{typeof item === 'string' ? item : item.label}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </SearchPortal>
        </div>
    );
}
