"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import {
  Heart,
  MessageCircle,
  User,
  LogOut,
  PlusCircle,
  Search,
  Menu,
  X,
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  Package,
  Star,
  Home,
  Car,
  Laptop,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";

function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const isAdminEmail = (email: string) => email === "jootiyasarl@gmail.com";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

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

        // Re-check unread on sign in
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
      window.removeEventListener("scroll", handleScroll);
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
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "Immobilier", href: "/marketplace?category=real-estate", icon: Home },
    { name: "Véhicules", href: "/marketplace?category=vehicles", icon: Car },
    { name: "Électronique", href: "/marketplace?category=electronics", icon: Laptop },
    { name: "Maison", href: "/marketplace?category=home", icon: Package },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Main Nav Row */}
        <div className="flex h-16 items-center justify-between gap-8 py-2">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center shrink-0">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white">
                JOOTIYA <span className="text-orange-500">.</span>
              </span>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl px-4">
            <div className="w-full max-w-xl">
              <UnifiedSearchBar />
            </div>
          </div>

          {/* Right: User Actions / Info */}
          <div className="flex items-center gap-3">
            <Link href="/marketplace/post" className="hidden lg:block shrink-0">
              <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black h-10 px-5 text-[10px] uppercase tracking-wider shadow-lg shadow-orange-200/40 dark:shadow-orange-900/40 transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap border border-orange-400/20">
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Déposer une annonce</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
              <ThemeToggle compact />
              <NotificationBell />

              <Link href="/dashboard/favorites" className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative" title="Favoris">
                <Heart className="w-5 h-5" />
              </Link>

              <Link href="/dashboard/messages" className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative" title="Messages">
                <MessageCircle className="w-5 h-5" />
                {hasUnreadMessages && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-900" />
                )}
              </Link>

              <div className="ml-1 pl-1 border-l border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                {userEmail ? (
                  <>
                    <Link href={isAdmin ? "/admin" : "/dashboard"}
                      className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      title={isAdmin ? "Administration" : "Mon Compte"}
                    >
                      {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </Link>
                    <button onClick={handleLogout} className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all" title="Déconnexion">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all" title="Connexion">
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Unified Search Bar */}
        <div className="pb-3 md:hidden">
          <UnifiedSearchBar />
        </div>
      </div>

      {/* Mobile Drawer Overlay - HIGHEST Z-INDEX */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Overlay - Covers entire screen */}
          <div
            className="lg:hidden fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar Menu - Slides from left */}
          <div className="lg:hidden fixed top-0 bottom-0 left-0 z-[9999] w-full h-screen bg-white dark:bg-zinc-900 animate-in slide-in-from-left duration-300 ease-out flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
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

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">

              {/* Theme Selector - Custom Compact Icons */}
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
                          "p-2 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-white dark:bg-zinc-700 text-orange-600 shadow-sm"
                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                      >
                        <Icon className="w-4 h-4 stroke-[2]" />
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
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700"
                    >
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
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200 dark:shadow-none transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Se connecter</span>
                  </Link>
                )}
              </div>

              {/* Categories Section */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">Toutes les catégories</h3>
                <div className="grid grid-cols-1 gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-all"
                    >
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

            {/* Drawer Footer */}
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
    </header>
  );
}

export default PublicNavbar;
