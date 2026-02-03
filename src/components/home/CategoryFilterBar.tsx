"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Smartphone, Home, Car, Shirt, Club, Baby, Package, Monitor, Watch, Camera, Headphones, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "electronics", label: "إلكترونيات", icon: Smartphone },
    { id: "vehicles", label: "سيارات", icon: Car },
    { id: "home", label: "منزل وأثاث", icon: Home },
    { id: "fashion", label: "أزياء", icon: Shirt },
    { id: "sports", label: "رياضة", icon: Club },
    { id: "kids", label: "أطفال", icon: Baby },
    { id: "computers", label: "كمبيوتر", icon: Monitor },
    { id: "accessories", label: "اكسسوارات", icon: Watch },
    { id: "cameras", label: "كاميرات", icon: Camera },
    { id: "audio", label: "صوتيات", icon: Headphones },
    { id: "decor", label: "ديكور", icon: Armchair },
    { id: "other", label: "أخرى", icon: Package },
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
                        <span className="text-xs font-medium">الكل</span>
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
