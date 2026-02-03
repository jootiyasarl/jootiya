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
  Laptop
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
    { name: "Immobilier", href: "/marketplace?category=real-estate", icon: Home },
    { name: "Véhicules", href: "/marketplace?category=vehicles", icon: Car },
    { name: "Électronique", href: "/marketplace?category=electronics", icon: Laptop },
    { name: "Maison", href: "/marketplace?category=home", icon: Package },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Main Nav Row */}
        <div className="flex h-16 md:h-20 items-center justify-between gap-4 py-2">
          {/* Left: Logo & Post Ad */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center shrink-0">
              <span className="text-2xl md:text-3xl font-black tracking-tighter text-blue-600">
                JOOTIYA
              </span>
            </Link>

            <Link href="/marketplace/post" className="hidden lg:block">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-100 transition-all active:scale-[0.98] flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span>Déposer une annonce</span>
              </Button>
            </Link>
          </div>

          {/* Center: Search Bar (Leboncoin style) */}
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <input
              type="text"
              placeholder="Rechercher sur Jootiya..."
              className="w-full bg-zinc-100 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50/50 rounded-xl py-3 pr-14 pl-5 text-[15px] transition-all outline-none placeholder:text-zinc-500"
            />
            <button className="absolute inset-y-1.5 right-1.5 px-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors shadow-sm">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Right: User Actions / Info */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden lg:flex items-center">
              <Link href="/dashboard/searches" className="flex flex-col items-center gap-1 px-4 py-1.5 group transition-colors">
                <NotificationBell />
                <span className="text-[11px] font-bold text-zinc-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">Recherches</span>
              </Link>

              <Link href="/dashboard/favorites" className="flex flex-col items-center gap-1 px-4 py-1.5 group transition-colors">
                <Heart className="w-6 h-6 text-zinc-800 group-hover:text-blue-600 transition-colors" />
                <span className="text-[11px] font-bold text-zinc-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">Favoris</span>
              </Link>

              <Link href="/dashboard/messages" className="flex flex-col items-center gap-1 px-4 py-1.5 group transition-colors">
                <MessageCircle className="w-6 h-6 text-zinc-800 group-hover:text-blue-600 transition-colors" />
                <span className="text-[11px] font-bold text-zinc-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">Messages</span>
              </Link>

              <div className="ml-4 pl-4 border-l border-zinc-200">
                {userEmail ? (
                  <div className="flex items-center gap-3">
                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex flex-col items-center gap-1 px-2 group transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all ring-1 ring-blue-100">
                        {isAdmin ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <span className="text-[11px] font-bold text-zinc-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {isAdmin ? "Admin" : "Compte"}
                      </span>
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Déconnexion">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="flex flex-col items-center gap-1 px-4 group transition-colors">
                    <User className="w-6 h-6 text-zinc-800 group-hover:text-blue-600 transition-colors" />
                    <span className="text-[11px] font-bold text-zinc-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">Connexion</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Icons */}
            <div className="lg:hidden flex items-center gap-1">
              <Link href="/marketplace" className="p-2.5 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
                <Search className="w-6 h-6" />
              </Link>
              <Link href="/marketplace/post">
                <Button size="icon" className="w-10 h-10 rounded-xl bg-blue-600 shadow-md shadow-blue-100">
                  <PlusCircle className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Row (Bottom Nav) */}
        <div className="flex overflow-x-auto no-scrollbar py-2 border-t border-zinc-100 lg:border-none scroll-smooth">
          <nav className="flex items-center gap-8 whitespace-nowrap min-w-full">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[13px] font-bold text-zinc-600 hover:text-blue-600 transition-all border-b-2 border-transparent hover:border-blue-600 py-1.5 flex items-center gap-1.5 group"
              >
                <link.icon className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                {link.name}
              </Link>
            ))}
            <div className="h-4 w-px bg-zinc-200 mx-2 hidden lg:block" />
            <Link href="/marketplace" className="text-[13px] font-black text-zinc-900 hover:text-blue-600 py-1.5 flex items-center gap-1.5 group">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Bons plans
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-300 ease-out flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <span className="text-2xl font-black text-blue-600 tracking-tighter">JOOTIYA</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-full bg-zinc-100 text-zinc-600 transition-active active:scale-95">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
              {/* User Section in Drawer */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 px-1">Compte personnel</h3>
                {userEmail ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">Mon profil</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[150px]">{userEmail}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm"
                    >
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-100 active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <span>Se connecter / S'inscrire</span>
                  </Link>
                )}
              </div>

              {/* Categories Section */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 px-1">Toutes les catégories</h3>
                <div className="grid grid-cols-1 gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                          <link.icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{link.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                  <Link
                    href="/marketplace"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-amber-50 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:bg-white group-hover:text-amber-600 transition-colors">
                        <Star className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">Bons plans</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-zinc-100 bg-zinc-50/50">
              <Link href="/marketplace/post" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-100 text-base flex items-center justify-center gap-2">
                  <PlusCircle className="w-6 h-6" />
                  Déposer une annonce
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default PublicNavbar;
