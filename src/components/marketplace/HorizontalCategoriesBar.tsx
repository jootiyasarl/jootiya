"use client";

import { 
    Smartphone, 
    Car, 
    Shirt, 
    Package, 
    Armchair, 
    Hammer, 
    Gamepad2, 
    PawPrint, 
    BookOpen, 
    Tag,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
    { id: "all", label: "Tout", icon: LayoutGrid, bg: "bg-zinc-100 text-zinc-600" },
    { id: "electronics", label: "Électronique", icon: Smartphone, bg: "bg-blue-50 text-blue-600" },
    { id: "home-furniture", label: "Maison & Ameublement", icon: Armchair, bg: "bg-green-50 text-green-600" },
    { id: "vehicles", label: "Véhicules & Transport", icon: Car, bg: "bg-orange-50 text-orange-600" },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt, bg: "bg-pink-50 text-pink-600" },
    { id: "tools-equipment", label: "Outils & Équipement", icon: Hammer, bg: "bg-zinc-100 text-zinc-600" },
    { id: "hobbies", label: "Loisirs & Diverتissement", icon: Gamepad2, bg: "bg-purple-50 text-purple-600" },
    { id: "animals", label: "Animaux", icon: PawPrint, bg: "bg-amber-50 text-amber-600" },
    { id: "books", label: "Livres & Études", icon: BookOpen, bg: "bg-sky-50 text-sky-600" },
    { id: "used-clearance", label: "Occasions", icon: Tag, bg: "bg-red-50 text-red-600" },
    { id: "other", label: "Autres", icon: Package, bg: "bg-slate-50 text-slate-600" },
];

export function HorizontalCategoriesBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "all";

    const handleCategoryClick = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id === "all") {
            params.delete("category");
        } else {
            params.set("category", id);
        }
        router.push(`/marketplace?${params.toString()}`);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-4 mt-8 border-b border-zinc-50 bg-white sticky top-0 z-30">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x pb-4 pt-2 px-2 -mx-2">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 flex-shrink-0 transition-all duration-300 group snap-center min-w-[80px]",
                                isActive ? "scale-105" : "opacity-70 hover:opacity-100"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                                isActive 
                                    ? `${cat.bg} border-orange-200 shadow-[0_8px_16px_-4px_rgba(249,115,22,0.2)] ring-4 ring-orange-500/5` 
                                    : "bg-zinc-50 border-zinc-100 shadow-sm group-hover:bg-white group-hover:border-zinc-200 group-hover:shadow-md"
                            )}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-tight text-center leading-tight line-clamp-1",
                                isActive ? "text-zinc-900" : "text-zinc-500"
                            )}>
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
