"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Global handler that catches Google OAuth returns on ANY page (including the
 * Site URL root "/" with a hash like #access_token=...), syncs the session to
 * server cookies, and always redirects the user to the Post Ad page.
 *
 * This avoids depending on Supabase "Additional Redirect URLs" configuration,
 * since the Site URL ("/") is always an allowed redirect target.
 */
export function OAuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const params = new URLSearchParams(search);

    const hasHashToken = hash.includes("access_token") || hash.includes("error");
    const hasCode = params.has("code");

    // Only act when this looks like an OAuth provider return
    if (!hasHashToken && !hasCode) return;

    const cleanUrl = () => {
      try {
        const url = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, url);
      } catch {}
    };

    const run = async () => {
      try {
        // Allow detectSessionInUrl to process the hash first
        await new Promise((r) => setTimeout(r, 50));

        let { data: { session } } = await supabase.auth.getSession();

        // PKCE code flow fallback
        if (!session && hasCode) {
          const code = params.get("code") as string;
          const { data } = await supabase.auth.exchangeCodeForSession(code);
          session = data?.session ?? null;
        }

        if (!session) return;

        try {
          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session }),
          });
        } catch {}

        // Fallback: if Supabase dropped the user on the root (redirectTo not
        // whitelisted), send them to the Post Ad page. Otherwise just clean
        // the URL and stay where redirectTo already landed them.
        const onRoot = window.location.pathname === "/";
        if (onRoot) {
          router.replace("/marketplace/post");
        } else {
          cleanUrl();
          router.refresh();
        }
      } catch {
        // ignore
      }
    };

    run();
  }, [router]);

  return null;
}
