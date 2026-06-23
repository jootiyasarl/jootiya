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
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useRouter } from "next/navigation";

interface DesktopActionsProps {
    initialUserEmail?: string | null;
    initialIsAdmin?: boolean;
}

export function DesktopActions({ initialUserEmail = null, initialIsAdmin = false }: DesktopActionsProps) {
    const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
    const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const router = useRouter();

    const isAdminEmail = (email: string) => email === "jootiyasarl@gmail.com";
    const isAdminPhone = (phone: string) => phone === "0618112646";

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const user = session.user;
                setUserEmail(user.email ?? null);
                setIsGoogleUser(
                    user.app_metadata?.provider === "google" ||
                    Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers.includes("google")
                );
                
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, phone')
                    .eq('id', user.id)
                    .maybeSingle();

                const isAuthorized = 
                    user.email === "jootiyasarl@gmail.com" || 
                    profile?.role === "super_admin" || 
                    profile?.role === "admin" ||
                    profile?.phone === "0618112646";

                setIsAdmin(isAuthorized);

                // Session sync for server on admin detection
                if (isAuthorized) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        document.cookie = `sb-access-token=${session.access_token}; path=/; SameSite=Lax; max-age=${session.expires_in};`;
                    }
                }
                
                // Fetch unread messages count
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_read', false)
                    .neq('sender_id', user.id);

                setHasUnreadMessages(count !== null && count > 0);
            } else {
                setUserEmail(null);
                setIsAdmin(false);
                setHasUnreadMessages(false);
                setIsGoogleUser(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Use session from auth state change event
            const user = session?.user;
            
            if (user) {
                setUserEmail(user.email ?? null);
                setIsGoogleUser(
                    user.app_metadata?.provider === "google" ||
                    Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers.includes("google")
                );

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, phone')
                    .eq('id', user.id)
                    .maybeSingle();

                const isAuthorized = 
                    user.email === "jootiyasarl@gmail.com" || 
                    profile?.role === "super_admin" || 
                    profile?.role === "admin" ||
                    profile?.phone === "0618112646";

                setIsAdmin(isAuthorized);

                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_read', false)
                    .neq('sender_id', user.id);

                setHasUnreadMessages(count !== null && count > 0);
            } else {
                setUserEmail(null);
                setIsAdmin(false);
                setHasUnreadMessages(false);
                setIsGoogleUser(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const syncSessionAndGo = async (href: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                window.location.assign(`/login?redirectTo=${encodeURIComponent(href)}`);
                return;
            }

            const maxAge = 60 * 60 * 24 * 365 * 20;
            document.cookie = `sb-access-token=${session.access_token}; path=/; SameSite=Lax; max-age=${maxAge}`;
            if (session.refresh_token) {
                document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; SameSite=Lax; max-age=${maxAge}`;
            }

            await fetch("/api/auth/set-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session }),
                credentials: "include",
                cache: "no-store",
            });

            window.location.assign(href);
        } catch (error) {
            console.error("Failed to sync session before navigation", error);
            window.location.assign(href);
        }
    };

    const handleLogout = async () => {
        try {
            setUserEmail(null);
            setIsAdmin(false);
            setHasUnreadMessages(false);
            setIsGoogleUser(false);
            await supabase.auth.signOut();
            await fetch("/api/auth/logout", { method: "POST" });
            
            // Clear all possible auth cookies manually to be safe
            document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "sb-access-token=; path=/; SameSite=Lax; max-age=0";

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
            
            {isGoogleUser ? (
                <>
                    <NotificationBell />
                    <button
                        type="button"
                        onClick={() => syncSessionAndGo("/dashboard/favorites")}
                        className="btn btn-ghost btn-circle btn-sm"
                        aria-label="Voir vos annonces favorites"
                        title="Favoris"
                    >
                        <Heart className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => syncSessionAndGo("/dashboard/messages")}
                        className="btn btn-ghost btn-circle btn-sm relative"
                        aria-label="Voir vos messages"
                        title="Messages"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {hasUnreadMessages && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-900" />
                        )}
                    </button>

                    <div className="ml-1 pl-1 border-l border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                        {isAdmin ? (
                            <Link
                                href="/admin"
                                className="btn btn-warning btn-circle btn-sm"
                                title="Admin Panel"
                                rel="nofollow"
                            >
                                <ShieldAlert className="w-5 h-5" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => syncSessionAndGo("/dashboard/profile")}
                                className="btn btn-ghost btn-circle btn-sm"
                                title="Mon profil"
                            >
                                <User className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="btn btn-ghost btn-circle btn-sm text-zinc-400 hover:text-red-500"
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
                        className="btn btn-primary btn-sm gap-2"
                        rel="nofollow"
                    >
                        <User className="w-4 h-4" />
                        Connexion
                    </Link>
                </div>
            )}
        </div>
    );
}
