"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Heart,
    MessageCircle,
    User,
    LogOut,
    ShieldAlert,
    LayoutDashboard,
    Package,
    Settings,
    ChevronDown
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DesktopActionsProps {
    initialUserEmail?: string | null;
    initialIsAdmin?: boolean;
}

export function DesktopActions({ initialUserEmail = null, initialIsAdmin = false }: DesktopActionsProps) {
    const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
    const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [fullName, setFullName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    const isAdminEmail = (email: string) => email === "jootiyasarl@gmail.com";
    const isAdminPhone = (phone: string) => phone === "0618112646";

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const user = session.user;
                setUserEmail(user.email ?? null);

                const meta = user.user_metadata ?? {};
                setAvatarUrl(meta.avatar_url || meta.picture || null);
                
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, phone, full_name, avatar_url')
                    .eq('id', user.id)
                    .maybeSingle();

                setFullName(profile?.full_name || meta.full_name || meta.name || null);
                if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

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
                setFullName(null);
                setAvatarUrl(null);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Use session from auth state change event
            const user = session?.user;
            
            if (user) {
                setUserEmail(user.email ?? null);

                const meta = user.user_metadata ?? {};
                setAvatarUrl(meta.avatar_url || meta.picture || null);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, phone, full_name, avatar_url')
                    .eq('id', user.id)
                    .maybeSingle();

                setFullName(profile?.full_name || meta.full_name || meta.name || null);
                if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

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
                setFullName(null);
                setAvatarUrl(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) return;
            const maxAge = 60 * 60 * 24 * 365 * 20;
            document.cookie = `sb-access-token=${session.access_token}; path=/; SameSite=Lax; max-age=${maxAge}`;
            if (session.refresh_token) {
                document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; SameSite=Lax; max-age=${maxAge}`;
            }
            fetch("/api/auth/set-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session }),
                credentials: "include",
                cache: "no-store",
            }).catch(() => {});
        });
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            setUserEmail(null);
            setIsAdmin(false);
            setHasUnreadMessages(false);
            setFullName(null);
            setAvatarUrl(null);
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
            
            {userEmail ? (
                <>
                    <NotificationBell />
                    <button
                        type="button"
                        onClick={() => { window.location.href = "/dashboard/favorites"; }}
                        className="btn btn-ghost btn-circle btn-sm"
                        aria-label="Voir vos annonces favorites"
                        title="Favoris"
                    >
                        <Heart className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => { window.location.href = "/dashboard/messages"; }}
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
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="btn btn-warning btn-circle btn-sm"
                                title="Admin Panel"
                                rel="nofollow"
                            >
                                <ShieldAlert className="w-5 h-5" />
                            </Link>
                        )}

                        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                            <DropdownMenuTrigger
                                className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                aria-label="Menu du compte"
                            >
                                <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt={fullName || "Profil"}
                                            fill
                                            sizes="32px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                </span>
                                <ChevronDown className="h-4 w-4 text-zinc-400" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-64">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                            {fullName || "Mon compte"}
                                        </span>
                                        {userEmail && (
                                            <span className="text-xs font-normal text-zinc-500 truncate">
                                                {userEmail}
                                            </span>
                                        )}
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => { window.location.href = "/dashboard"; }}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Tableau de bord
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/ads"; }}>
                                    <Package className="mr-2 h-4 w-4" />
                                    Mes annonces
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/profile"; }}>
                                    <User className="mr-2 h-4 w-4" />
                                    Mon profil
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/settings"; }}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Paramètres
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 focus:text-red-600 dark:text-red-400"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
