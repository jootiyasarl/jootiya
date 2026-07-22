import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { JootiyaProSearchBar } from "@/components/search/JootiyaProSearchBar";
import { DesktopActions } from "./DesktopActions";
import { MobileMenu } from "./MobileMenu";
import { getServerUser } from "@/lib/supabase-server";
import { NavbarLogo } from "./NavbarLogo";
import { HeaderCategories } from "./HeaderCategories";

export default async function PublicNavbar() {
  const user = await getServerUser();
  const userEmail = user?.email ?? null;
  const isAdmin = userEmail === "jootiyasarl@gmail.com";

  return (
    <header className="navbar fixed top-0 left-0 right-0 z-[100] w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 flex flex-col justify-center min-h-[56px] md:min-h-[64px] pt-[env(safe-area-inset-top)] overflow-visible">
      <div className="w-full px-1 min-[360px]:px-2 sm:px-4 md:px-8 max-w-[1440px] mx-auto overflow-visible">
        {/* Main Nav Row (TOP) */}
        <div className="flex h-12 md:h-14 items-center justify-between gap-0.5 min-[360px]:gap-1 sm:gap-4 relative z-[110] py-2 min-w-0 overflow-visible">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0 min-w-0">
            <NavbarLogo />
          </div>

          {/* Center: Search Bar */}
          <div className="flex flex-1 justify-center px-0.5 min-[360px]:px-1 sm:px-6 relative z-[120] min-w-0 overflow-visible">
            <div className="w-full max-w-2xl flex justify-center min-w-0 overflow-visible">
              <Suspense fallback={<div className="w-full h-9 min-[360px]:h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 animate-pulse" />}>
                <JootiyaProSearchBar />
              </Suspense>
            </div>
          </div>

          {/* Right: User Actions / Info */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0 relative z-[130]">
            <Link
              href="/marketplace/post"
              className="hidden xl:block shrink-0"
              rel="nofollow"
              aria-label="Déposer une annonce"
            >
              <div className="btn bg-orange-500 hover:bg-orange-600 border-none text-white h-10 min-h-0 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-all active:scale-[0.98]">
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

        {/* Categories Row (BOTTOM) */}
        <div className="hidden md:block border-t border-zinc-50 dark:border-zinc-900/50">
          <HeaderCategories />
        </div>
      </div>
    </header>
  );
}
