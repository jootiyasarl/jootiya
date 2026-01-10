"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PublicNavbar from "./PublicNavbar";

interface RootNavbarShellProps {
  children: ReactNode;
}

export function RootNavbarShell({ children }: RootNavbarShellProps) {
  const pathname = usePathname();

  const hideNavbar =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/moderator");

  return (
    <>
      {!hideNavbar && <PublicNavbar />}
      {children}
    </>
  );
}
