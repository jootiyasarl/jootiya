"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OAuthCallbackClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    const run = async () => {
      try {
        // Give Supabase a tick to process hash tokens if present (implicit flow)
        await new Promise((r) => setTimeout(r, 0));

        let { data: { session } } = await supabase.auth.getSession();

        // If no session yet and we have a code, use PKCE exchange
        if (!session && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error || !data?.session) {
            router.replace("/login");
            return;
          }
          session = data.session;
        }

        if (!session) {
          router.replace("/login");
          return;
        }

        try {
          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session }),
          });

          // Per requirement: after Google login, always go to Post Ad page
          router.replace("/poste-annonce");
        } catch {
          router.replace("/poste-annonce");
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
