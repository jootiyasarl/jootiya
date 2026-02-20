"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function usePageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackView = async () => {
      // Don't track admin pages
      if (pathname?.startsWith("/admin")) return;

      try {
        const userAgent = window.navigator.userAgent;
        const referrer = document.referrer;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
        const deviceType = isMobile ? "mobile" : "desktop";

        await supabase.from("page_views").insert({
          page_path: pathname,
          device_type: deviceType,
          referrer: referrer || "direct",
        });
      } catch (err) {
        console.error("Failed to track page view:", err);
      }
    };

    trackView();
  }, [pathname, searchParams]);
}
