"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, LogOut, LayoutDashboard, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Seller Layout
 *
 * A minimal client-side shell for every `/seller/*` page. It provides:
 * - A branded top navigation bar.
 * - A logout button that clears the session on the client and on the server.
 *
 * Note: route protection itself is handled by middleware.ts so this layout
 * never needs to perform an auth check itself.
 */

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Sign out from the Supabase client.
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error", err);
    }

    try {
      // 2. Ask the server to clear the HTTP-only cookies (session_token, user_role, etc.).
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Failed to clear auth session:", err);
    }

    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sb-access-token=; path=/; SameSite=Lax; max-age=0";
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // 3. Redirect to the public login page and refresh the router cache.
    router.replace("/login");
    router.refresh();
  };

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
