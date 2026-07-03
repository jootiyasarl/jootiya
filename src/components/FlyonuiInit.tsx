"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FlyonuiInit() {
  const pathname = usePathname();

  useEffect(() => {
    // Dynamic import to prevent Node.js/SSR execution issues
    import("flyonui/flyonui")
      .then(() => {
        if (typeof window !== "undefined" && (window as any).HSStaticMethods) {
          (window as any).HSStaticMethods.autoInit();
        }
      })
      .catch((err) => {
        console.error("Failed to load FlyonUI script:", err);
      });
  }, []);

  useEffect(() => {
    // Small delay to allow Next.js DOM render to complete
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && (window as any).HSStaticMethods) {
        (window as any).HSStaticMethods.autoInit();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
