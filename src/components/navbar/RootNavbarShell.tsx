"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";

interface RootNavbarShellProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}

export function RootNavbarShell({ children, navbar, footer }: RootNavbarShellProps) {
  const pathname = usePathname();

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
            {children}
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
