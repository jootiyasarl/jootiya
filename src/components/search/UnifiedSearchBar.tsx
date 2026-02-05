"use client";

import { Search, MapPin, ChevronDown, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";

const CATEGORIES = [
    "Toutes les catégories",
    "Immobilier",
    "Véhicules",
    "Électronique",
    "Maison",
    "Mode",
    "Loisirs",
    "Autres"
];

export function UnifiedSearchBar() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Toutes les catégories");
    const [location, setLocation] = useState("Choisir ville - secteur");

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            {/* Desktop Version */}
            <div className="hidden lg:flex items-center bg-white border border-zinc-200 rounded-full shadow-lg shadow-zinc-200/50 p-1.5 h-16">
                {/* Keyword Search */}
                <div className="flex-1 flex items-center px-4 gap-3 border-r border-zinc-100">
                    <Search className="w-5 h-5 text-zinc-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Que recherchez-vous ?"
                        className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-zinc-400"
                    />
                </div>

                {/* Category Select */}
                <div className="relative group px-4 border-r border-zinc-100 min-w-[220px]">
                    <button className="flex items-center justify-between w-full gap-3 text-zinc-700 hover:text-blue-600 transition-colors">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-blue-500" />
                            <span className="text-[14px] font-bold truncate">{category}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                </div>

                {/* Location Select */}
                <div className="relative group px-4 min-w-[240px]">
                    <button className="flex items-center justify-between w-full gap-3 text-zinc-700 hover:text-blue-600 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center">
                                <MapPin className="w-4.5 h-4.5 text-zinc-900" />
                            </div>
                            <span className="text-[14px] font-bold truncate">{location}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                </div>

                {/* Search Button */}
                <Button className="h-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black px-10 shadow-lg shadow-blue-200/50 flex items-center gap-2 text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Search className="w-5 h-5" />
                    Rechercher
                </Button>
            </div>

            {/* Mobile Version */}
            <div className="lg:hidden flex flex-col gap-3">
                <div className="flex items-center bg-white border border-zinc-200 rounded-2xl shadow-md px-4 h-14">
                    <Search className="w-5 h-5 text-zinc-400 mr-3" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Que recherchez-vous ?"
                        className="flex-1 bg-transparent outline-none text-[15px] font-medium placeholder:text-zinc-400"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-3 h-12 text-zinc-700">
                        <div className="flex items-center gap-2 min-w-0">
                            <LayoutGrid className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-[13px] font-bold truncate">{category}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    </button>

                    <button className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-3 h-12 text-zinc-700">
                        <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-zinc-900 shrink-0" />
                            <span className="text-[13px] font-bold truncate">Ma ville</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    </button>
                </div>

                <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-base">
                    <Search className="w-6 h-6" />
                    Rechercher
                </Button>
            </div>
        </div>
    );
}
