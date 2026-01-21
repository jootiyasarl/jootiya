"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

function PublicNavbar() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setUserEmail(session?.user?.email ?? null);
    };

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePostAdClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const email = session?.user?.email ?? "";

    if (!session) {
      router.push("/login?redirectTo=/dashboard/ads/create");
      return;
    }

    if (email === "jootiyasarl@gmail.com") {
      router.push("/admin");
      return;
    }

    router.push("/dashboard/ads/create");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to clear auth session", error);
    }

    setUserEmail(null);
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">
          {/* Left: Logo + primary action */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tight text-orange-500">
                jootiya
              </span>
            </Link>
            <button
              type="button"
              onClick={handlePostAdClick}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400"
            >
              Déposer une annonce
            </button>
          </div>

          {/* Center: Search bar */}
          <div className="flex flex-1 justify-center">
            <div className="flex w-full max-w-xl items-center rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-500 shadow-inner">
              <input
                type="search"
                placeholder="Rechercher sur jootiya"
                className="w-full bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white"
                aria-label="Rechercher"
              >
                🔍
              </button>
            </div>
          </div>

          {/* Right: Icons / account */}
          <div className="hidden items-center gap-6 text-[11px] font-medium text-zinc-600 sm:flex">
            <button
              type="button"
              className="flex flex-col items-center gap-1 hover:text-zinc-900"
            >
              <span className="text-lg">🔔</span>
              <span>Mes recherches</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 hover:text-zinc-900"
            >
              <span className="text-lg">❤</span>
              <span>Favoris</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 hover:text-zinc-900"
            >
              <span className="text-lg">💬</span>
              <span>Messages</span>
            </button>
            {userEmail ? (
              <div className="flex flex-col items-center gap-1">
                <Link
                  href={
                    userEmail === "jootiyasarl@gmail.com" ? "/admin" : "/dashboard"
                  }
                  className="flex flex-col items-center gap-1 hover:text-zinc-900"
                >
                  <span className="text-lg">👤</span>
                  <span>Mon compte</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[10px] text-zinc-400 hover:text-zinc-700"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center gap-1 hover:text-zinc-900"
              >
                <span className="text-lg">👤</span>
                <span>Se connecter</span>
              </Link>
            )}
          </div>
        </div>

        {/* Category menu */}
        <nav className="flex h-10 items-center text-sm text-zinc-700">
          <ul className="flex flex-wrap gap-4 text-xs sm:text-sm">
            {[
              "Immobilier",
              "Véhicules",
              "Vacances",
              "Emploi",
              "Mode",
              "Maison & Jardin",
              "Famille",
              "Électronique",
              "Loisirs",
              "Autres",
              "Bons plans !",
            ].map((label, index) => (
              <li key={label}>
                <button
                  type="button"
                  className={cn(
                    "text-zinc-700 hover:text-orange-600",
                    index === 10 && "font-semibold text-orange-600",
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default PublicNavbar;
