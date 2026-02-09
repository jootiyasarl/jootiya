"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import PublicNavbar from "./PublicNavbar";
import { MobileBottomNav } from "./MobileBottomNav";
import Footer from "../layout/Footer";

interface RootNavbarShellProps {
  children: ReactNode;
}

export function RootNavbarShell({ children }: RootNavbarShellProps) {
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
      {!isSpecialPath && (
        <>
          <Suspense fallback={<div className="h-16 w-full bg-white border-b border-zinc-200" />}>
            <PublicNavbar />
          </Suspense>
          {/* Hide Bottom Nav on Post Ad and Ad Details pages to prevent overlap with sticky actions */}
          {!(pathname?.startsWith('/marketplace/post') || pathname?.startsWith('/ads/')) && (
            <MobileBottomNav />
          )}
        </>
      )}
      <main className="min-h-screen">
        {children}
      </main>
      {!isSpecialPath && <Footer />}
    </>
  );
}
