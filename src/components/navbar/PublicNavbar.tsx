import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { DesktopActions } from "./DesktopActions";
import { MobileMenu } from "./MobileMenu";

interface PublicNavbarProps {
  isHome?: boolean;
}

export default function PublicNavbar({ isHome = false }: PublicNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Main Nav Row */}
        <div className="flex h-16 items-center justify-between gap-8 py-2">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center shrink-0">
              {isHome ? (
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white">
                  JOOTIYA <span className="text-orange-500">.</span>
                </h1>
              ) : (
                <div className="text-xl md:text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white">
                  JOOTIYA <span className="text-orange-500">.</span>
                </div>
              )}
            </Link>
          </div>

          {/* Center: Search Bar */}
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
            <DesktopActions />

            {/* Mobile Menu Component (Client-side) */}
            <MobileMenu />
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
