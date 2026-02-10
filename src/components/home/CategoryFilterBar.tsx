"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Smartphone, Car, Shirt, Package, Armchair, Hammer, Gamepad2, PawPrint, BookOpen, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "electronics", label: "Électronique", icon: Smartphone },
    { id: "home-furniture", label: "Maison & Ameublement", icon: Armchair },
    { id: "vehicles", label: "Véhicules & Transport", icon: Car },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt },
    { id: "tools-equipment", label: "Outils & Équipement", icon: Hammer },
    { id: "hobbies", label: "Loisirs & Divertissement", icon: Gamepad2 },
    { id: "animals", label: "Animaux", icon: PawPrint },
    { id: "books", label: "Livres & Études", icon: BookOpen },
    { id: "used-clearance", label: "Occasion / Déstockage", icon: Tag },
    { id: "other", label: "Autres", icon: Package },
];

export function CategoryFilterBar() {
    const searchParams = useSearchParams();
    const currentCategory = searchParams?.get("category");

    return (
        <div className="sticky top-[64px] z-30 w-full border-b border-zinc-100 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex w-full items-center gap-8 overflow-x-auto pb-4 pt-4 scrollbar-hide">
                    <Link
                        href="/marketplace"
                        className={cn(
                            "group flex min-w-fit flex-col items-center gap-2 border-b-2 pb-2 transition-all hover:text-zinc-900",
                            !currentCategory
                                ? "border-zinc-900 text-zinc-900"
                                : "border-transparent text-zinc-500 hover:border-zinc-300"
                        )}
                    >
                        <div className="h-6 w-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                        </div>
                        <span className="text-xs font-medium">Tout</span>
                    </Link>

                    {CATEGORIES.map((category) => {
                        const isActive = currentCategory === category.id;
                        const Icon = category.icon;

                        return (
                            <Link
                                key={category.id}
                                href={`/marketplace?category=${category.id}`}
                                className={cn(
                                    "group flex min-w-fit flex-col items-center gap-2 border-b-2 pb-2 transition-all hover:text-zinc-900",
                                    isActive
                                        ? "border-zinc-900 text-zinc-900"
                                        : "border-transparent text-zinc-500 hover:border-zinc-300"
                                )}
                            >
                                <Icon className={cn("h-6 w-6 stroke-[1.5]", isActive && "stroke-zinc-900")} />
                                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
                                    {category.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
