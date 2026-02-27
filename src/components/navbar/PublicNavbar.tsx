import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { SimpleSearchBar } from "@/components/search/SimpleSearchBar";
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
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex flex-col justify-center h-auto">
      <div className="mx-auto max-w-7xl w-full px-4 md:px-6">
        {/* Main Nav Row */}
        <div className="flex h-12 md:h-14 items-center justify-between gap-8 relative">
          {/* Left: Logo (Centered on Mobile, Left on Desktop) */}
          <div className="flex items-center md:relative absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 shrink-0">
            <NavbarLogo />
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex flex-1 justify-center px-6">
            <div className="w-full max-w-2xl">
            <SimpleSearchBar />
            </div>
          </div>

          {/* Right: User Actions / Info */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
                href="/marketplace/post"
                className="hidden lg:block shrink-0"
                rel="nofollow"
                aria-label="Déposer une annonce"
            >
                <div className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black h-11 px-5 text-[10px] uppercase tracking-wider shadow-[0_12px_30px_rgba(255,102,0,0.18)] hover:shadow-[0_18px_40px_rgba(255,102,0,0.22)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
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

        {/* Categories Row */}
        <div className="hidden md:block">
          <HeaderCategories />
        </div>
      </div>
    </header>
  );
}
