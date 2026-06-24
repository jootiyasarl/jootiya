"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

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

        // Persist server cookies (HttpOnly) so server components read user from cookies
        try {
          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: data.session }),
          });

          const isAdmin = data.session.user?.email === "jootiyasarl@gmail.com";
          router.replace(isAdmin ? "/admin" : "/marketplace/post");
        } catch {
          router.replace("/marketplace/post");
        }
      } catch (e) {
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
