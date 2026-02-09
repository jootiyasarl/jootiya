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
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";

function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Main Nav Row */}
        <div className="flex h-16 items-center justify-between gap-4 py-2">
          {/* Left: Logo & Post Ad */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-[#0F172A]">
                JOOTIYA <span className="text-orange-500">.</span>
              </span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl px-2">
              <UnifiedSearchBar />
            </div>

            <Link href="/marketplace/post" className="hidden lg:block shrink-0">
              <div className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 px-4 text-sm shadow-md shadow-orange-200/50 transition-all hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Déposer une annonce</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 max-w-xl" />


          {/* Right: User Actions / Info */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden lg:flex items-center">
              <NotificationBell label="Notifications" />

              <Link href="/dashboard/favorites" className="flex flex-col items-center gap-0 px-4 py-1 group transition-colors">
                <div className="p-1.5 rounded-full group-hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-zinc-800 group-hover:text-orange-600 transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-zinc-600 group-hover:text-orange-600 transition-colors uppercase tracking-tight -mt-1">Favoris</span>
              </Link>

              <Link href="/dashboard/messages" className="flex flex-col items-center gap-0 px-4 py-1 group transition-colors relative">
                <div className="p-1.5 rounded-full group-hover:bg-orange-50 transition-colors relative">
                  <MessageCircle className="w-5 h-5 text-zinc-800 group-hover:text-orange-600 transition-colors" />
                  {hasUnreadMessages && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <span className="text-[11px] font-bold text-zinc-600 group-hover:text-orange-600 transition-colors uppercase tracking-tight -mt-1">Messages</span>
              </Link>

              <div className="ml-2 pl-2 border-l border-zinc-200">
                {userEmail ? (
                  <div className="flex items-center gap-3">
                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex flex-col items-center gap-0 px-2 group transition-colors">
                      <div className="p-1.5 rounded-full group-hover:bg-zinc-100 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all ring-1 ring-orange-100 text-[10px]">
                          {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-600 group-hover:text-orange-600 transition-colors uppercase tracking-tight -mt-1">
                        {isAdmin ? "Admin" : "Compte"}
                      </span>
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Déconnexion">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="flex flex-col items-center gap-0 px-4 py-1 group transition-colors">
                    <div className="p-1.5 rounded-full group-hover:bg-orange-50 transition-colors">
                      <User className="w-5 h-5 text-zinc-800 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-600 group-hover:text-orange-600 transition-colors uppercase tracking-tight -mt-1">Connexion</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Icons - Simplified 
            <div className="lg:hidden flex items-center gap-0.5">
               <NotificationBell label="" iconOnly />
            </div>
            */}
          </div>
        </div>

        {/* Mobile Unified Search Bar - Minimalist Row */}
        <div className="pb-3 md:hidden">
          <UnifiedSearchBar />
        </div>


      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-300 ease-out flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <span className="text-2xl font-black text-[#0F172A] tracking-tighter">JOOTIYA<span className="text-orange-500">.</span></span>
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
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-100">
                          <User className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">Mon profil</p>
                          <p className="text-[11px] text-zinc-500 truncate max-w-[150px]">{userEmail}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-orange-600 transition-colors" />
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
                    className="flex items-center gap-4 p-4 rounded-2xl bg-orange-600 text-white font-black shadow-xl shadow-orange-100 active:scale-[0.98] transition-all"
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
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-orange-50 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:bg-white group-hover:text-orange-600 transition-colors shadow-sm shadow-zinc-200/50">
                          <link.icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">{link.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
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
              {/* Info Pages Section */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 px-1">INFORMATIONS</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-zinc-50 group transition-all"
                  >
                    <span className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">À propos</span>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-zinc-50 group transition-all"
                  >
                    <span className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">Contact</span>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-zinc-100 bg-zinc-50/50">
              <Link href="/marketplace/post" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
                  <PlusCircle className="w-6 h-6" />
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
