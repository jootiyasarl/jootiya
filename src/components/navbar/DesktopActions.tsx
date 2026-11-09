"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Heart,
    MessageCircle,
    User,
    LogOut,
    ShieldAlert
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useRouter } from "next/navigation";

interface DesktopActionsProps {
    initialUserEmail?: string | null;
    initialIsAdmin?: boolean;
}

export function DesktopActions({ initialUserEmail = null, initialIsAdmin = false }: DesktopActionsProps) {
    const { user, userEmail: authEmail, isAdmin: authIsAdmin } = useAuth();
    // SSR-seeded props avoid a flash of the logged-out UI before hydration
    const userEmail = authEmail ?? initialUserEmail;
    const isAdmin = authIsAdmin || initialIsAdmin;
    const [unreadResult, setUnreadResult] = useState<{
        userId: string;
        has: boolean;
    } | null>(null);
    const router = useRouter();

    // Unread-messages badge — the only per-component query left.
    // Tagged with userId so stale results never leak across accounts.
    useEffect(() => {
        if (!user?.id) return;
        let active = true;
        supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .neq('sender_id', user.id)
            .then(({ count }) => {
                if (active) {
                    setUnreadResult({
                        userId: user.id,
                        has: count !== null && count > 0,
                    });
                }
            });
        return () => {
            active = false;
        };
    }, [user?.id]);

    const hasUnreadMessages =
        !!user?.id && unreadResult?.userId === user.id && unreadResult.has;

    const handleLogout = async () => {
        try {
            setUnreadResult(null);
            
            try {
                await supabase.auth.signOut();
            } catch (err) {
                console.error("Supabase signOut error", err);
            }

            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } catch (err) {
                console.error("Server logout API error", err);
            }
            
            // Clear all possible auth cookies manually to be safe
            document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "sb-access-token=; path=/; SameSite=Lax; max-age=0";
            document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

            if (typeof window !== "undefined") {
                localStorage.clear();
                sessionStorage.clear();
            }

            router.refresh();
            window.location.assign("/");
        } catch (error) {
            console.error("Failed to clear auth session", error);
            router.refresh();
            window.location.assign("/");
        }
    };

    return (
        <div className="hidden lg:flex items-center gap-1.5 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
            <ThemeToggle compact />
            
            {userEmail ? (
                <>
                    <NotificationBell />
                    <Link
                        href="/dashboard/favorites"
                        className="btn btn-ghost btn-square rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all relative"
                        aria-label="Voir vos annonces favorites"
                        title="Favoris"
                        rel="nofollow"
                    >
                        <Heart className="w-5 h-5" />
                    </Link>

                    <Link
                        href="/dashboard/messages"
                        className="btn btn-ghost btn-square rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all relative indicator"
                        aria-label="Voir vos messages"
                        title="Messages"
                        rel="nofollow"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {hasUnreadMessages && (
                            <span className="indicator-item badge badge-primary badge-xs" />
                        )}
                    </Link>

                    <div className="ml-1 pl-1 border-l border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                        {isAdmin ? (
                            <Link
                                href="/admin"
                                className="btn btn-primary btn-square rounded-xl text-orange-600 bg-orange-50 border border-orange-200 dark:text-orange-500 dark:bg-orange-950/20 dark:border-orange-900/30 transition-all shadow-sm shadow-orange-500/10 hover:scale-105"
                                title="Admin Panel"
                                rel="nofollow"
                            >
                                <ShieldAlert className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard"
                                className="btn btn-ghost btn-square rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all"
                                title="Mon Compte"
                                rel="nofollow"
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="btn btn-ghost btn-square text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                            title="Déconnexion"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </>
            ) : (
                <div className="ml-1 pl-1 border-l border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                    <Link
                        href="/login"
                        className="btn bg-orange-500 hover:bg-orange-600 border-none flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
                        rel="nofollow"
                    >
                        <User className="w-4 h-4" />
                        <span>Connexion</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
