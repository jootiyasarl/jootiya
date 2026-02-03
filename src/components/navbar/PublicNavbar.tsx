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
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";

function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUserEmail(session?.user?.email ?? null);
        setIsAdmin(session?.user?.email ? isAdminEmail(session.user.email) : false);
      } else if (event === "SIGNED_OUT") {
        setUserEmail(null);
        setIsAdmin(false);
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
    { name: "Immobilier", href: "/marketplace?category=real-estate" },
    { name: "Véhicules", href: "/marketplace?category=vehicles" },
    { name: "Électronique", href: "/marketplace?category=electronics" },
    { name: "Maison", href: "/marketplace?category=home" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main Nav Row */}
        <div className="flex h-16 items-center justify-between gap-4 py-2">
          {/* Left: Logo & Post Ad */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black tracking-tighter text-blue-600">
                JOOTIYA
              </span>
            </Link>
            <Link href="/marketplace/post" className="hidden lg:block">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 shadow-sm transition-all active:scale-[0.98] gap-2">
                <PlusCircle className="w-5 h-5 font-bold" />
                <span>Déposer une annonce</span>
              </Button>
            </Link>
          </div>

          {/* Center: Search Bar (Leboncoin style) */}
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg text-white cursor-pointer hover:bg-blue-700 transition-colors">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <input
              type="text"
              placeholder="Rechercher sur Jootiya..."
              className="w-full bg-zinc-100 border-none focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 pr-12 pl-4 text-sm transition-all outline-none"
            />
          </div>

          {/* Right: User Actions / Info */}
          <div className="flex items-center gap-1">
            <div className="hidden lg:flex items-center">
              <Link href="/dashboard/searches" className="flex flex-col items-center gap-0.5 px-3 py-1 group">
                <NotificationBell />
                <span className="text-[10px] font-medium text-zinc-600 group-hover:text-blue-600">Mes recherches</span>
              </Link>
              <Link href="/dashboard/favorites" className="flex flex-col items-center gap-0.5 px-3 py-1 group">
                <Heart className="w-5 h-5 text-zinc-800 group-hover:text-blue-600" />
                <span className="text-[10px] font-medium text-zinc-600 group-hover:text-blue-600">Favoris</span>
              </Link>
              <Link href="/dashboard/messages" className="flex flex-col items-center gap-0.5 px-3 py-1 group">
                <MessageCircle className="w-5 h-5 text-zinc-800 group-hover:text-blue-600" />
                <span className="text-[10px] font-medium text-zinc-600 group-hover:text-blue-600">Messages</span>
              </Link>

              <div className="ml-2 pl-2 border-l border-zinc-200">
                {userEmail ? (
                  <div className="flex items-center gap-2">
                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex flex-col items-center gap-0.5 px-3 group">
                      {isAdmin ? <ShieldAlert className="w-5 h-5 text-zinc-800 group-hover:text-blue-600" /> : <User className="w-5 h-5 text-zinc-800 group-hover:text-blue-600" />}
                      <span className="text-[10px] font-medium text-zinc-600 group-hover:text-blue-600">
                        {isAdmin ? "Admin" : "Mon compte"}
                      </span>
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Déconnexion">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="flex flex-col items-center gap-0.5 px-3 group">
                    <User className="w-5 h-5 text-zinc-800 group-hover:text-blue-600" />
                    <span className="text-[10px] font-medium text-zinc-600 group-hover:text-blue-600">Se connecter</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Search & Post Icons */}
            <div className="lg:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden">
                <Search className="w-5 h-5" />
              </Button>
              <Link href="/marketplace/post">
                <Button size="icon" className="rounded-xl bg-blue-600 lg:hidden">
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Row (Bottom Nav) */}
        <div className="flex overflow-x-auto no-scrollbar py-2 border-t border-zinc-100 lg:border-none scroll-smooth">
          <nav className="flex items-center gap-6 whitespace-nowrap">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-700 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 py-1"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/marketplace" className="text-sm font-bold text-zinc-900 hover:text-blue-600 py-1">
              Bons plans !
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-xl font-black text-blue-600">JOOTIYA</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-zinc-100">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-8 overflow-y-auto h-full pb-20">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Catégories</h3>
              <div className="grid grid-cols-1 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-3 px-4 rounded-xl hover:bg-zinc-50 font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Compte</h3>
              {userEmail ? (
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/dashboard" className="flex items-center py-3 px-4 rounded-xl hover:bg-zinc-50 font-medium">Mon tableau de bord</Link>
                  <button onClick={handleLogout} className="flex items-center py-3 px-4 rounded-xl hover:bg-zinc-50 font-medium text-red-600 text-left">Déconnexion</button>
                </div>
              ) : (
                <Link href="/login" className="flex items-center justify-center p-4 rounded-xl bg-blue-600 text-white font-bold w-full">
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default PublicNavbar;
