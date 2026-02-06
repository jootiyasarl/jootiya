"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
    const pathname = usePathname();

    const links = [
        { label: "Accueil", icon: Home, href: "/" },
        { label: "Explorer", icon: Search, href: "/marketplace" },
        { label: "Vendre", icon: PlusCircle, href: "/marketplace/post", isAction: true },
        { label: "Messages", icon: MessageCircle, href: "/dashboard/messages" },
        { label: "Profil", icon: User, href: "/dashboard" },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-2 pb-safe-bottom shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="mx-auto flex h-16 max-w-md items-center justify-between">
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

                    if (link.isAction) {
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="relative -top-3 flex flex-col items-center"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 ring-4 ring-white transition-transform active:scale-90">
                                    <link.icon className="h-7 w-7" />
                                </div>
                                <span className="mt-1 text-[10px] font-bold text-orange-500">{link.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90",
                                isActive ? "text-orange-500" : "text-zinc-400"
                            )}
                        >
                            <link.icon className={cn("h-6 w-6", isActive && "fill-current/10")} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
