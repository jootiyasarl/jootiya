"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function SessionSync({ defaultNext }: { defaultNext?: string }) {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted || !session) return;

      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });

      const nextParam = search?.get("next") || search?.get("redirectTo");
      if (nextParam && (window.location.pathname === "/" || window.location.pathname === "/login")) {
        router.replace(nextParam);
      } else if (defaultNext && window.location.pathname === "/login") {
        router.replace(defaultNext);
      }
    };

    // Initial sync in case we landed on apex with # fragment
    sync();

    // Also sync on any auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      sync();
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [router, search, defaultNext]);

  return null;
}
