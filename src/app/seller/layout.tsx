"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Store, LogOut, LayoutDashboard, User, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  const lockDashboard = async (reason?: string) => {
    setIsLocked(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {}

    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    if (reason) {
      toast.error(reason);
    }

    window.location.href = "/login?next=/seller/dashboard";
  };

  useEffect(() => {
    async function checkSellerAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        lockDashboard("Session non valide. Veuillez vous connecter.");
      }
    }

    checkSellerAuth();

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        lockDashboard("Déconnexion détectée. Verrouillage de l'espace vendeur...");
      }
    });

    // Check session on tab focus
    const handleFocus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        lockDashboard("Session expirée. Redirection...");
      }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleLogout = async () => {
    await lockDashboard("Déconnexion réussie");
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 text-white p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4 animate-pulse">
          <ShieldCheck className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-black mb-2 text-zinc-100 uppercase tracking-wider">Espace Vendeur Verrouillé</h2>
        <p className="text-xs text-zinc-400 mb-6 text-center max-w-sm font-medium">
          La session est terminée ou expirée. Redirection vers la page de connexion...
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="navbar sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl px-4 sm:px-6">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between w-full">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-black text-zinc-900 tracking-tight"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Store className="w-5 h-5" />
            </div>
            Jootiya Seller
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/seller/dashboard"
              className="btn btn-ghost btn-sm rounded-xl flex items-center gap-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border-none font-bold"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/seller/profile"
              className="btn btn-ghost btn-sm rounded-xl flex items-center gap-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border-none font-bold"
            >
              <User className="w-4 h-4" />
              Profil
            </Link>
          </nav>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center gap-2 border-none font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
