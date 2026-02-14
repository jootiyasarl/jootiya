"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import {
    X,
    Menu,
    User,
    LogOut,
    ChevronRight,
    PlusCircle,
    Sun,
    Moon,
    Monitor,
    Home,
    Car,
    Laptop,
    Package
} from "lucide-react";
import { useTheme } from "next-themes";

interface MobileMenuProps {
    initialUserEmail?: string | null;
}

export function MobileMenu({ initialUserEmail = null }: MobileMenuProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUserEmail(session?.user?.email ?? null);
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserEmail(session?.user?.email ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            document.body.style.position = 'unset';
            document.body.style.width = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            document.body.style.position = 'unset';
            document.body.style.width = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Failed to clear auth session", error);
        }
        window.location.href = "/";
    };

    const navLinks = [
        { name: "Immobilier", href: "/categories/real-estate", icon: Home },
        { name: "Véhicules", href: "/categories/vehicles", icon: Car },
        { name: "Électronique", href: "/categories/electronics", icon: Laptop },
        { name: "Maison", href: "/categories/home-furniture", icon: Package },
    ];

    return (
        <>
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                aria-label="Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[10000] bg-white dark:bg-zinc-950 transition-opacity lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed top-0 bottom-0 left-0 z-[10001] w-full h-screen bg-white dark:bg-zinc-900 animate-in slide-in-from-left duration-300 ease-out flex flex-col lg:hidden overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900 shadow-sm relative z-10">
                            <span className="text-xl font-black text-[#0F172A] dark:text-white tracking-tighter">
                                JOOTIYA<span className="text-orange-500">.</span>
                            </span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                            {/* Apparence */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">Apparence</h3>
                                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl w-fit">
                                    {[
                                        { id: 'light', icon: Sun },
                                        { id: 'system', icon: Monitor },
                                        { id: 'dark', icon: Moon },
                                    ].map((opt) => {
                                        const Icon = opt.icon;
                                        const isActive = theme === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setTheme(opt.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    isActive ? "bg-white dark:bg-zinc-700 text-orange-600 shadow-sm" : "text-zinc-400"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* User Section */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">Compte personnel</h3>
                                {userEmail ? (
                                    <div className="space-y-1">
                                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700" rel="nofollow">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Mon profil</span>
                                                    <span className="text-[11px] text-zinc-500 truncate max-w-[140px] leading-tight">{userEmail}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-500 transition-colors" />
                                        </Link>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium">
                                            <LogOut className="w-4 h-4" />
                                            Déconnexion
                                        </button>
                                    </div>
                                ) : (
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200 dark:shadow-none transition-all" rel="nofollow">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold">Se connecter</span>
                                    </Link>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">Toutes les catégories</h3>
                                <div className="grid grid-cols-1 gap-1">
                                    {navLinks.map((link) => (
                                        <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-orange-600 transition-colors">
                                                    <link.icon className="w-5 h-5 stroke-[1.5]" />
                                                </div>
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{link.name}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Link href="/marketplace/post" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-200 dark:shadow-none text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
                                    <PlusCircle className="w-4 h-4" />
                                    Déposer une annonce
                                </div>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
