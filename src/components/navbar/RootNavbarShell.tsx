"use client";

import { ReactNode, Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const MobileBottomNav = dynamic(() => import("./MobileBottomNav").then(mod => mod.MobileBottomNav), {
  ssr: false
});

const SidebarAd = dynamic(() => import("@/components/ads/SidebarAd").then(mod => mod.SidebarAd), {
  ssr: false
});

interface RootNavbarShellProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}

export function RootNavbarShell({ children, navbar, footer }: RootNavbarShellProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  const isSpecialPath =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/moderator") ||
    pathname?.startsWith("/login") ||
    pathname === "/login" ||
    pathname?.includes("/login") ||
    pathname?.startsWith("/register") ||
    pathname === "/register" ||
    pathname?.includes("/register") ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/forgot-password") ||
    pathname === "/forgot-password" ||
    pathname?.includes("/forgot-password");

  return (
    <>
      {!isSpecialPath && (
        <div>
          <Suspense fallback={<div className="h-16 w-full bg-white border-b border-zinc-200" />}>
            {navbar}
          </Suspense>
          <div className={cn(
            (pathname?.startsWith('/marketplace/post') || pathname?.startsWith('/ads/')) && "hidden"
          )}>
            <MobileBottomNav />
          </div>
        </div>
      )}
      <main className={cn(
        "min-h-screen",
        !isSpecialPath && "pt-[56px] md:pt-[64px]"
      )}>
        <div className={cn(!isSpecialPath && "main-content-wrapper")}>
          {!isSpecialPath ? (
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
                {/* Left Global Sidebar Ad */}
                <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                  <SidebarAd />
                </aside>

                {/* Main Page Content */}
                <div className="flex-1 min-w-0 w-full">
                  {children}
                </div>

                {/* Right Global Sidebar Ad */}
                <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                  <SidebarAd />
                </aside>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
      {!isSpecialPath && (
        <div>
          {footer}
        </div>
      )}
    </>
  );
}
