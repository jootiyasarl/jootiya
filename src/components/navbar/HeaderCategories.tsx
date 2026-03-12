"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Smartphone, Car, Shirt, Package, Armchair, Hammer, Gamepad2, PawPrint, BookOpen, Tag, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "electronics", label: "Électronique", icon: Smartphone, color: "text-blue-500" },
    { id: "home-furniture", label: "Maison", icon: Armchair, color: "text-orange-500" },
    { id: "vehicles", label: "Véhicules", icon: Car, color: "text-red-500" },
    { id: "fashion", label: "Mode", icon: Shirt, color: "text-pink-500" },
    { id: "tools-equipment", label: "Outils", icon: Hammer, color: "text-zinc-600" },
    { id: "hobbies", label: "Loisirs", icon: Gamepad2, color: "text-purple-500" },
    { id: "animals", label: "Animaux", icon: PawPrint, color: "text-amber-600" },
    { id: "books", label: "Livres", icon: BookOpen, color: "text-emerald-600" },
    { id: "used-clearance", label: "Occasion", icon: Tag, color: "text-orange-600" },
    { id: "other", label: "Autres", icon: Package, color: "text-zinc-400" },
];

export function HeaderCategories() {
    const searchParams = useSearchParams();
    const currentCategory = searchParams?.get("category");

    return (
        <div className="w-full bg-white dark:bg-zinc-950 relative z-0">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex w-full items-center justify-between gap-2 overflow-x-auto py-2 scrollbar-hide">
                    <Link
                        href="/marketplace"
                        className={cn(
                            "group flex min-w-fit flex-col items-center gap-1.5 transition-all relative pb-1",
                            !currentCategory ? "text-orange-600" : "text-zinc-500 hover:text-orange-600"
                        )}
                    >
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                            !currentCategory ? "bg-orange-50 dark:bg-orange-950/30" : "bg-zinc-50 dark:bg-zinc-900 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/30"
                        )}>
                            <LayoutGrid className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight whitespace-nowrap overflow-visible">Tout</span>
                        {!currentCategory && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-600" />
                        )}
                    </Link>

                    {CATEGORIES.map((category) => {
                        const isActive = currentCategory === category.id;
                        const Icon = category.icon;

                        return (
                            <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                className={cn(
                                    "group flex min-w-fit flex-col items-center gap-1.5 transition-all relative pb-1",
                                    isActive ? "text-orange-600" : "text-zinc-500 hover:text-orange-600"
                                )}
                            >
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                                    isActive 
                                        ? "bg-orange-50 dark:bg-orange-950/30" 
                                        : "bg-zinc-50 dark:bg-zinc-900 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/30"
                                )}>
                                    <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-orange-600" : category.color)} />
                                </div>
                                <span className={cn("text-[11px] font-bold tracking-tight whitespace-nowrap overflow-visible", isActive && "text-orange-600")}>
                                    {category.label}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-600" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
