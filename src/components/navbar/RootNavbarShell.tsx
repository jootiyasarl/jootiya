"use client";

import { ReactNode, Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";
import dynamic from "next/dynamic";

const MobileBottomNav = dynamic(() => import("./MobileBottomNav").then(mod => mod.MobileBottomNav), {
  ssr: false
});

const MobileMenu = dynamic(() => import("./MobileMenu").then(mod => mod.MobileMenu), {
  ssr: false
});

const DesktopActions = dynamic(() => import("./DesktopActions").then(mod => mod.DesktopActions), {
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1280); // xl breakpoint
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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
          {/* Hide Bottom Nav on Post Ad and Ad Details pages to prevent overlap with sticky actions */}
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
          <PageTransition>
            {!isSpecialPath ? (
              <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
                  {/* Left Global Sidebar Ad - Only rendered on desktop */}
                  {isDesktop && (
                    <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                      <SidebarAd />
                    </aside>
                  )}

                  {/* Main Page Content */}
                  <div className="flex-1 min-w-0 w-full">
                    {children}
                  </div>

                  {/* Right Global Sidebar Ad - Only rendered on desktop */}
                  {isDesktop && (
                    <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                      <SidebarAd />
                    </aside>
                  )}
                </div>
              </div>
            ) : (
              children
            )}
          </PageTransition>
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
