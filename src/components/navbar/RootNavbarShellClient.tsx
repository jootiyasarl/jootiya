"use client";

import { ReactNode, Suspense } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const MobileBottomNav = dynamic(() => import("./MobileBottomNav").then((mod) => mod.MobileBottomNav), {
  ssr: false,
});

const SidebarAd = dynamic(() => import("@/components/ads/SidebarAd").then((mod) => mod.SidebarAd), {
  ssr: false,
});

interface RootNavbarShellClientProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}

export function RootNavbarShellClient({ children, navbar, footer }: RootNavbarShellClientProps) {
  const pathname = usePathname();

  const isSpecialPath =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/moderator") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/auth/reset-password");

  return (
    <>
      {!isSpecialPath && (
        <div className="contents">
          <Suspense fallback={<div className="h-16 w-full bg-white border-b border-zinc-200" />}>
            {navbar}
          </Suspense>
          <div
            className={cn((pathname?.startsWith("/marketplace/post") || pathname?.startsWith("/ads/")) && "hidden")}
          >
            <MobileBottomNav />
          </div>
        </div>
      )}

      <main className={cn("min-h-screen", !isSpecialPath && "pt-[56px] md:pt-[64px] pb-20 lg:pb-0")}
      >
        <div className={cn(!isSpecialPath && "main-content-wrapper")}
        >
          {!isSpecialPath ? (
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
                <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                  <SidebarAd />
                </aside>

                <div className="flex-1 min-w-0 w-full">{children}</div>

                <aside className="hidden xl:block w-40 sticky top-24 shrink-0">
                  <SidebarAd />
                </aside>
              </div>
            </div>
          ) : (
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
              {children}
            </div>
          )}
        </div>
      </main>

      {!isSpecialPath && <div>{footer}</div>}
    </>
  );
}
