"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileLocationFilter } from "@/components/home/MobileLocationFilter";

export function MobileBottomNav() {
    const pathname = usePathname();

    // Hide bottom nav on chat detail pages to give full space to the conversation
    if (pathname?.startsWith("/dashboard/messages/") && pathname !== "/dashboard/messages") {
        return null;
    }

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] pb-[env(safe-area-inset-bottom)]">
            <div className="grid h-16 grid-cols-5 mx-auto max-w-md items-center px-1">
                <Link
                    href="/"
                    className={cn(
                        "inline-flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 group gap-1 transition-all",
                        pathname === "/" ? "text-orange-600" : "text-zinc-400 dark:text-zinc-500"
                    )}
                    aria-label="Accueil"
                >
                    <Home className="w-6 h-6 group-hover:text-orange-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:text-orange-600">
                        Accueil
                    </span>
                </Link>

                <Link
                    href="/dashboard/favorites"
                    className={cn(
                        "inline-flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 group gap-1 transition-all",
                        pathname === "/dashboard/favorites" ? "text-orange-600" : "text-zinc-400 dark:text-zinc-500"
                    )}
                    aria-label="Vos favoris"
                >
                    <Heart className="w-6 h-6 group-hover:text-orange-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:text-orange-600">
                        Favoris
                    </span>
                </Link>

                <Link
                    href="/marketplace/post"
                    className="inline-flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 group relative -top-5"
                    aria-label="Vendre un article"
                >
                    <div className="p-3 bg-orange-500 rounded-full shadow-lg shadow-orange-200 group-hover:bg-orange-600 transition-all border-4 border-white active:scale-95">
                        <PlusCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 mt-1">Vendre</span>
                </Link>

                <Link
                    href="/dashboard/messages"
                    className={cn(
                        "inline-flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 group gap-1 transition-all",
                        pathname === "/dashboard/messages" ? "text-orange-600" : "text-zinc-400 dark:text-zinc-500"
                    )}
                    aria-label="Vos messages"
                >
                    <MessageCircle className="w-6 h-6 group-hover:text-orange-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:text-orange-600">
                        Messages
                    </span>
                </Link>

                <Link
                    href="/dashboard"
                    className={cn(
                        "inline-flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 group gap-1 transition-all",
                        pathname === "/dashboard" ? "text-orange-600" : "text-zinc-400 dark:text-zinc-500"
                    )}
                    aria-label="Votre profil"
                >
                    <User className="w-6 h-6 group-hover:text-orange-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:text-orange-600">
                        Profil
                    </span>
                </Link>
            </div>
        </div>
    );
}
