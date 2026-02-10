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
                                        className="flex flex-col items-center justify-center group absolute left-1/2 -translate-x-1/2 -top-8 z-[110]"
                                    >
                                        {/* Hero Circle Button with Enhanced Shadow */}
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] shadow-[0_8px_30px_rgb(255,107,0,0.4)] flex items-center justify-center transition-transform duration-200 active:scale-95 hover:scale-110">
                                            <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                                        </div>
                                        {/* Label */}
                                        <span className="text-[10px] font-bold text-[#FF6B00] mt-1">
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
                                        "flex flex-col items-center justify-center gap-1 transition-colors duration-200 py-2 px-3",
                                        "group"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 transition-colors",
                                            isActive
                                                ? "text-[#FF6B00]"
                                                : "text-zinc-400 dark:text-zinc-500 group-hover:text-[#FF6B00]"
                                        )}
                                        strokeWidth={1.5}
                                    />
                                    <span
                                        className={cn(
                                            "text-[10px] font-medium transition-colors",
                                            isActive
                                                ? "text-[#FF6B00] font-bold"
                                                : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#FF6B00]"
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
