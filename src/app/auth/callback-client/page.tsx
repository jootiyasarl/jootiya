"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OAuthCallbackClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const rawNext = searchParams.get("next") || searchParams.get("redirectTo") || "";
    const safeNext = (() => {
      if (!rawNext) return "";
      try {
        const n = decodeURIComponent(rawNext);
        // prevent open redirects; allow only internal paths
        if (n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\\\")) return n;
      } catch {}
      return "";
    })();

    if (!code) {
      router.replace("/login");
      return;
    }

    const run = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data?.session) {
          router.replace("/login");
          return;
        }

        try {
          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: data.session }),
          });

          // Per requirement: after Google login, always go to Post Ad page
          router.replace("/marketplace/post");
        } catch {
          router.replace("/marketplace/post");
        }
      } catch {
        router.replace("/login");
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm font-bold text-zinc-500">Connexion en cours...</div>
    </div>
  );
}
