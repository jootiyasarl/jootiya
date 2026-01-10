"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { MegaMenuCities } from "./MegaMenuCities";
import { MegaMenuCategories } from "./MegaMenuCategories";

interface DesktopMegaMenuItemProps {
  href: string;
  label: string;
  children: ReactNode;
  isActive?: boolean;
}

function DesktopMegaMenuItem({
  href,
  label,
  children,
  isActive,
}: DesktopMegaMenuItemProps) {
  return (
    <li className="relative group">
      <Link
        href={href}
        className={cn(
          "border-b-2 border-transparent px-1.5 pb-1 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:border-zinc-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300",
          isActive && "border-zinc-900 text-zinc-900",
        )}
        aria-haspopup="true"
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
      <div className="pointer-events-none absolute left-1/2 top-full z-30 hidden w-[520px] -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:block group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:block group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {children}
      </div>
    </li>
  );
}

function PublicNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinkClass = (href: string) =>
    cn(
      "border-b-2 border-transparent px-1.5 pb-1 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:border-zinc-200 hover:text-zinc-900",
      isActive(href) && "border-zinc-900 text-zinc-900",
    );

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

    if (session) {
      router.push("/post-ad");
    } else {
      router.push("/login?redirect=/post-ad");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              JY
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Jootiya
            </span>
          </Link>
        </div>

        {/* Center: Main navigation (desktop) */}
        <nav
          aria-label="التنقل الرئيسي للموقع"
          className="hidden flex-1 justify-center md:flex"
        >
          <ul className="flex items-center gap-7 text-sm font-medium text-zinc-600">
            <li>
              <Link
                href="/sell"
                className={navLinkClass("/sell")}
                aria-current={isActive("/sell") ? "page" : undefined}
              >
                بيع
              </Link>
            </li>
            <li>
              <Link
                href="/ads"
                className={navLinkClass("/ads")}
                aria-current={isActive("/ads") ? "page" : undefined}
              >
                اشترِ
              </Link>
            </li>
            {/* Mega menu: Cities (desktop only) */}
            <DesktopMegaMenuItem
              href="/cities"
              label="المدن"
              isActive={isActive("/cities")}
            >
              <MegaMenuCities />
            </DesktopMegaMenuItem>
            {/* Mega menu: Categories (desktop only) */}
            <DesktopMegaMenuItem
              href="/categories"
              label="الفئات"
              isActive={isActive("/categories")}
            >
              <MegaMenuCategories />
            </DesktopMegaMenuItem>
            <li>
              <Link
                href="/wholesale"
                className={navLinkClass("/wholesale")}
                aria-current={
                  isActive("/wholesale") ? "page" : undefined
                }
              >
                الجملة
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className={navLinkClass("/blog")}
                aria-current={isActive("/blog") ? "page" : undefined}
              >
                المدوّنة
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePostAdClick}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            نشر إعلان
          </button>

          {userEmail ? (
            <>
              <span className="hidden text-xs text-zinc-500 lg:inline">
                {userEmail}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
              >
                خروج
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
            >
              دخول
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
