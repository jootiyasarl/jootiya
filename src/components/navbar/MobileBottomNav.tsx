"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileLocationFilter } from "@/components/home/MobileLocationFilter";

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-2 pb-safe-bottom shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="grid h-16 grid-cols-5 mx-auto max-w-md items-center">
                <Link
                    href="/"
                    className={cn(
                        "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group gap-1",
                        pathname === "/" ? "text-orange-600" : "text-zinc-400"
                    )}
                >
                    <Home className="w-6 h-6 group-hover:text-orange-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:text-orange-600">
                        Accueil
                    </span>
                </Link>

                {/* Radar / Location Filter - Replaces Search icon since Search is in top bar */}
                <div className="flex items-center justify-center">
                    <Suspense fallback={<div className="w-8 h-8 rounded-full bg-zinc-50 animate-pulse" />}>
                        <MobileLocationFilter />
                    </Suspense>
                </div>

                <Link
                    href="/marketplace/post"
                    className="inline-flex flex-col items-center justify-center px-2 group relative -top-5"
                >
                    <div className="p-3 bg-orange-500 rounded-full shadow-lg shadow-orange-200 group-hover:bg-orange-600 transition-all border-4 border-white active:scale-95">
                        <PlusCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 mt-1">Vendre</span>
                </Link>

                <Link
                    href="/dashboard/messages"
                    className={cn(
                        "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group gap-1",
                        pathname === "/dashboard/messages" ? "text-orange-600" : "text-zinc-400"
                    )}
                >
                    <MessageCircle className="w-6 h-6 group-hover:text-orange-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:text-orange-600">
                        Messages
                    </span>
                </Link>

                <Link
                    href="/dashboard"
                    className={cn(
                        "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group gap-1",
                        pathname === "/dashboard" ? "text-orange-600" : "text-zinc-400"
                    )}
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
