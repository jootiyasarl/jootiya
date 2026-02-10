"use client";

import { Home, Car, Laptop, Shirt, Armchair, Dumbbell, BookOpen, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const categories = [
    { id: "all", label: "Tout", icon: Home },
    { id: "vehicules", label: "Véhicules", icon: Car },
    { id: "electronique", label: "Électronique", icon: Laptop },
    { id: "mode", label: "Mode", icon: Shirt },
    { id: "meubles", label: "Meubles", icon: Armchair },
    { id: "sports", label: "Sports", icon: Dumbbell },
    { id: "livres", label: "Livres", icon: BookOpen },
    { id: "jeux", label: "Jeux", icon: Gamepad2 },
];

export function HorizontalCategoriesBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "all";

    const handleCategoryClick = (categoryId: string) => {
        if (categoryId === "all") {
            router.push("/marketplace");
        } else {
            router.push(`/marketplace?category=${categoryId}`);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 sticky top-0 z-40 px-4">
            <div className="mx-auto max-w-7xl px-4 py-4">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 flex-shrink-0 transition-all duration-200",
                                    "group"
                                )}
                            >
                                {/* Circular Icon Container */}
                                <div
                                    className={cn(
                                        "w-[64px] h-[64px] rounded-2xl flex items-center justify-center transition-all duration-300 snap-center",
                                        isActive
                                            ? "bg-orange-500 shadow-lg shadow-orange-200 dark:shadow-none"
                                            : "glass-frosted group-active:scale-95"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 transition-colors",
                                            isActive
                                                ? "text-white"
                                                : "text-zinc-500 dark:text-zinc-400"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-tighter transition-colors",
                                        isActive
                                            ? "text-orange-600"
                                            : "text-zinc-500"
                                    )}
                                >
                                    {category.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
