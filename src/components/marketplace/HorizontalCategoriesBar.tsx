"use client";

import { Home, Car, Laptop, Shirt, Armchair, Dumbbell, BookOpen, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const categories = [
    { id: "all", label: "الكل", labelFr: "Tout", icon: Home },
    { id: "vehicules", label: "سيارات", labelFr: "Véhicules", icon: Car },
    { id: "electronique", label: "إلكترونيات", labelFr: "Électronique", icon: Laptop },
    { id: "mode", label: "موضة", labelFr: "Mode", icon: Shirt },
    { id: "meubles", label: "أثاث", labelFr: "Meubles", icon: Armchair },
    { id: "sports", label: "رياضة", labelFr: "Sports", icon: Dumbbell },
    { id: "livres", label: "كتب", labelFr: "Livres", icon: BookOpen },
    { id: "jeux", label: "ألعاب", labelFr: "Jeux", icon: Gamepad2 },
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
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 shadow-minimal">
            <div className="mx-auto max-w-7xl px-4 py-4">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth">
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
                                        "w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200",
                                        "border-2",
                                        isActive
                                            ? "border-[#FF6B00] bg-orange-50 dark:bg-orange-950/30"
                                            : "border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 group-hover:border-[#FF6B00] group-hover:bg-orange-50 dark:group-hover:bg-orange-950/30"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 transition-colors",
                                            isActive
                                                ? "text-[#FF6B00]"
                                                : "text-zinc-600 dark:text-zinc-400 group-hover:text-[#FF6B00]"
                                        )}
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-xs font-medium transition-colors whitespace-nowrap",
                                        isActive
                                            ? "text-[#FF6B00] font-bold"
                                            : "text-zinc-600 dark:text-zinc-400 group-hover:text-[#FF6B00]"
                                    )}
                                >
                                    {category.labelFr}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
