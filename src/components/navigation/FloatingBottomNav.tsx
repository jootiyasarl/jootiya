"use client";

import { Home, Heart, Plus, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { id: "home", label: "Accueil", icon: Home, href: "/marketplace" },
    { id: "favorites", label: "Favoris", icon: Heart, href: "/dashboard/favorites" },
    { id: "vendre", label: "Vendre", icon: Plus, href: "/ads/new", isHero: true },
    { id: "messages", label: "Messages", icon: MessageCircle, href: "/dashboard/messages" },
    { id: "profile", label: "Profil", icon: User, href: "/dashboard" },
];

export function FloatingBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe">
            {/* Background with blur */}
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 shadow-2xl">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center justify-around h-16 relative">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                            if (item.isHero) {
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className="flex flex-col items-center justify-center group relative z-[110] -mt-6"
                                    >
                                        {/* Hero Circle Button with Pro Design */}
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_8px_20px_rgba(249,115,22,0.3)] flex items-center justify-center transition-all duration-300 group-active:scale-90 group-hover:rotate-6">
                                            <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-orange-600 mt-1.5">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1 transition-all duration-300 py-2 px-3",
                                        "active:scale-90",
                                        isActive ? "translate-y-[-2px]" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "transition-all duration-300 rounded-xl p-1",
                                        isActive ? "bg-orange-50 dark:bg-orange-500/10" : ""
                                    )}>
                                        <Icon
                                            className={cn(
                                                "w-6 h-6 transition-colors",
                                                isActive
                                                    ? "text-orange-600"
                                                    : "text-zinc-400 dark:text-zinc-500"
                                            )}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold uppercase tracking-tight transition-colors",
                                            isActive
                                                ? "text-orange-600"
                                                : "text-zinc-500 dark:text-zinc-400"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
