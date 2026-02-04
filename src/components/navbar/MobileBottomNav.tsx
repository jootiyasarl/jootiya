"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Heart, User, LayoutDashboard, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
    const pathname = usePathname();

    // Hide bottom nav on specific paths if needed (e.g. inside a full-screen modal or chat)
    // For now, we show it everywhere on mobile except maybe full-screen post flow if we wanted, 
    // but the plan said show it.

    // Simple check to see if a link is active
    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname?.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 pb-[env(safe-area-inset-bottom)]">
            <nav className="flex items-center justify-around h-16 px-2">

                {/* Home */}
                <Link
                    href="/"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive("/") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <Home className={cn("w-6 h-6", isActive("/") && "fill-current")} />
                    <span className="text-[10px] font-medium">Accueil</span>
                </Link>

                {/* Search */}
                <Link
                    href="/marketplace"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive("/marketplace") && !pathname?.startsWith("/marketplace/post") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <Search className={cn("w-6 h-6", isActive("/marketplace") && !pathname?.startsWith("/marketplace/post") && "stroke-[3px]")} />
                    <span className="text-[10px] font-medium">Recherche</span>
                </Link>

                {/* Post Ad (Center) */}
                <Link
                    href="/marketplace/post"
                    className="flex flex-col items-center justify-center w-full h-full -mt-6"
                >
                    <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
                        isActive("/marketplace/post")
                            ? "bg-blue-700 text-white shadow-blue-200"
                            : "bg-blue-600 text-white shadow-blue-100"
                    )}>
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className={cn(
                        "text-[10px] font-bold mt-1",
                        isActive("/marketplace/post") ? "text-blue-600" : "text-zinc-500"
                    )}>
                        Vendre
                    </span>
                </Link>

                {/* Favorites */}
                <Link
                    href="/dashboard/favorites"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive("/dashboard/favorites") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <Heart className={cn("w-6 h-6", isActive("/dashboard/favorites") && "fill-current")} />
                    <span className="text-[10px] font-medium">Favoris</span>
                </Link>

                {/* Account */}
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive("/dashboard") && !isActive("/dashboard/favorites") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <User className={cn("w-6 h-6", isActive("/dashboard") && !isActive("/dashboard/favorites") && "fill-current")} />
                    <span className="text-[10px] font-medium">Compte</span>
                </Link>

            </nav>
        </div>
    );
}
