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
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200 shadow-sm py-2"
          : "bg-white border-b border-zinc-100 py-4"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tighter text-blue-600 group-hover:scale-105 transition-transform">
                JOOTIYA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Professional Look */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Rechercher n'importe quoi..."
              className="w-full bg-zinc-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 rounded-2xl py-2.5 pr-11 pl-4 text-sm transition-all outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {userEmail && (
              <div className="hidden sm:flex items-center gap-1 border-l border-zinc-200 pl-4">
                <NotificationBell />
                <Button variant="ghost" size="icon" className="rounded-full text-zinc-600 hover:text-red-600 hover:bg-red-50">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            )}

            {userEmail ? (
              <div className="flex items-center gap-3">
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  <Button className="hidden sm:flex gap-2 rounded-2xl bg-zinc-900 border-none hover:bg-zinc-800 text-white font-bold h-11 px-6 shadow-lg shadow-zinc-200 shadow-zinc-900/10">
                    {isAdmin ? <ShieldAlert className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                    <span>{isAdmin ? "Administration" : "Mon compte"}</span>
                  </Button>
                </Link>
                <div className="lg:relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="font-bold text-zinc-700 hover:text-blue-600 rounded-2xl hidden sm:flex">
                  Connexion
                </Button>
              </Link>
            )}

            <Link href="/marketplace/post">
              <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] gap-2">
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Déposer une annonce</span>
                <span className="sm:hidden text-lg">+</span>
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-200 animate-in slide-in-from-top duration-300">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
                >
                  <span className="text-sm font-bold">{link.name}</span>
                </Link>
              ))}
            </div>
            {!userEmail && (
              <div className="pt-4 border-t border-zinc-100">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-2xl h-12 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border-none font-bold">
                    Se connecter
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default PublicNavbar;
