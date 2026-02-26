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

interface DesktopActionsProps {
    initialUserEmail?: string | null;
    initialIsAdmin?: boolean;
}

export function DesktopActions({ initialUserEmail = null, initialIsAdmin = false }: DesktopActionsProps) {
    const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
    const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    const isAdminEmail = (email: string) => email === "jootiyasarl@gmail.com";
    const isAdminPhone = (phone: string) => phone === "0618112646";

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const user = session.user;
                setUserEmail(user.email ?? null);
                
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

                // تزامن الكوكيز للسيرفر عند اكتشاف الأدمن
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
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Use session from auth state change event
            const user = session?.user;
            
            if (user) {
                setUserEmail(user.email ?? null);

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
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            await fetch("/api/auth/logout", { method: "POST" });
            
            // Clear all possible auth cookies manually to be safe
            document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            
            window.location.href = "/";
        } catch (error) {
            console.error("Failed to clear auth session", error);
            window.location.href = "/";
        }
    };

    return (
        <div className="hidden lg:flex items-center gap-1.5 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
            <ThemeToggle compact />
            <NotificationBell />

            <Link
                href="/dashboard/favorites"
                className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative"
                aria-label="Voir vos annonces favorites"
                title="Favoris"
                rel="nofollow"
            >
                <Heart className="w-5 h-5" />
            </Link>

            <Link
                href="/dashboard/messages"
                className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative"
                aria-label="Voir vos messages"
                title="Messages"
                rel="nofollow"
            >
                <MessageCircle className="w-5 h-5" />
                {hasUnreadMessages && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-900" />
                )}
            </Link>

            <div className="ml-1 pl-1 border-l border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                {userEmail ? (
                    <>
                        {isAdmin ? (
                            <Link
                                href="/admin"
                                className="p-2.5 rounded-xl text-orange-600 bg-orange-50 border border-orange-200 dark:text-orange-500 dark:bg-orange-950/20 dark:border-orange-900/30 transition-all shadow-sm shadow-orange-500/10 hover:scale-105"
                                title="لوحة تحكم الأدمن"
                                rel="nofollow"
                            >
                                <ShieldAlert className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard"
                                className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                title="Mon Compte"
                                rel="nofollow"
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                            title="Déconnexion"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-1">
                        <Link
                            href="/login"
                            className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            aria-label="Se connecter à votre compte"
                            title="Connexion"
                            rel="nofollow"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
