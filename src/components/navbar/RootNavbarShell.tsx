"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";

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
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/onboarding");

  return (
    <>
      <div className={cn(isSpecialPath && "hidden")}>
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
      <main className="min-h-screen">
        {children}
      </main>
      <div className={cn(isSpecialPath && "hidden")}>
        {footer}
      </div>
    </>
  );
}
