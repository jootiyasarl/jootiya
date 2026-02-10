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

export function DesktopActions() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    const isAdminEmail = (email: string) => email === "jootiyasarl@gmail.com";

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);
                setIsAdmin(isAdminEmail(session.user.email));

                // Check for unread messages
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_read', false)
                    .neq('sender_id', session.user.id);

                setHasUnreadMessages(count !== null && count > 0);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN") {
                setUserEmail(session?.user?.email ?? null);
                setIsAdmin(session?.user?.email ? isAdminEmail(session.user.email) : false);

                if (session?.user) {
                    supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('is_read', false)
                        .neq('sender_id', session.user.id)
                        .then(({ count }) => setHasUnreadMessages(count !== null && count > 0));
                }
            } else if (event === "SIGNED_OUT") {
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
        await supabase.auth.signOut();
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Failed to clear auth session", error);
        }
        window.location.href = "/";
    };

    return (
        <div className="hidden lg:flex items-center gap-1.5 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
            <ThemeToggle compact />
            <NotificationBell />

            <Link
                href="/dashboard/favorites"
                className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative"
                title="Favoris"
                rel="nofollow"
            >
                <Heart className="w-5 h-5" />
            </Link>

            <Link
                href="/dashboard/messages"
                className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative"
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
                        <Link
                            href={isAdmin ? "/admin" : "/dashboard"}
                            className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            title={isAdmin ? "Administration" : "Mon Compte"}
                            rel="nofollow"
                        >
                            {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                            title="Déconnexion"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        title="Connexion"
                        rel="nofollow"
                    >
                        <User className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </div>
    );
}
