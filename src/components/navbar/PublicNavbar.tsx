import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { DesktopActions } from "./DesktopActions";
import { MobileMenu } from "./MobileMenu";
import { getServerUser } from "@/lib/supabase-server";
import { NavbarLogo } from "./NavbarLogo";

export default async function PublicNavbar() {
  const user = await getServerUser();
  const userEmail = user?.email ?? null;
  const isAdmin = userEmail === "jootiyasarl@gmail.com";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Main Nav Row */}
        <div className="flex h-16 items-center justify-between gap-8 py-2 relative">
          {/* Left: Logo (Centered on Mobile, Left on Desktop) */}
          <div className="flex items-center md:relative absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0">
            <NavbarLogo />
          </div>

          {/* Center: Search Bar (Desktop Only) */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl px-4">
            <div className="w-full max-w-xl">
              <UnifiedSearchBar />
            </div>
          </div>

          {/* Right: User Actions / Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/marketplace/post"
              className="hidden lg:block shrink-0"
              rel="nofollow"
            >
              <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black h-10 px-5 text-[10px] uppercase tracking-wider shadow-lg shadow-orange-200/40 dark:shadow-orange-900/40 transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap border border-orange-400/20">
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Déposer une annonce</span>
              </div>
            </Link>

            {/* Client-side actions (Auth, Notifications, Theme) */}
            <DesktopActions initialUserEmail={userEmail} initialIsAdmin={isAdmin} />

            {/* Mobile Menu Component (Client-side) */}
            <MobileMenu initialUserEmail={userEmail} />
          </div>
        </div>

        {/* Mobile Unified Search Bar */}
        <div className="pb-3 md:hidden">
          <UnifiedSearchBar />
        </div>
      </div>
    </header>
  );
}
