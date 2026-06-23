"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Connexion en cours...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. Check for hash fragment (implicit flow from Google)
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // 2. Check for PKCE code in query string
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");

        if (accessToken) {
          // Implicit flow: set session client-side first
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (sessionError || !sessionData.session) {
            setMessage("Erreur de session. Redirection...");
            router.push("/login?error=session_failed");
            return;
          }

          // Send session to server to create cookies
          const res = await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: sessionData.session }),
          });

          if (!res.ok) {
            setMessage("Erreur serveur. Redirection...");
            router.push("/login?error=server_error");
            return;
          }

          // Success - redirect to ad posting page
          router.push("/marketplace/post");
          return;
        }

        if (code) {
          // PKCE flow: the code should be handled server-side
          // But since we're here, try exchanging it client-side
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error || !data.session) {
            setMessage("Erreur d'authentification. Redirection...");
            router.push("/login?error=" + encodeURIComponent(error?.message || "auth_failed"));
            return;
          }

          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: data.session }),
          });

          router.push("/marketplace/post");
          return;
        }

        // No auth data found
        setMessage("Aucune donnée d'authentification trouvée.");
        setTimeout(() => router.push("/login?error=no_auth_data"), 2000);
      } catch (err) {
        console.error("Callback error:", err);
        setMessage("Erreur inattendue. Redirection...");
        router.push("/login?error=unexpected");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      <p className="text-zinc-600 font-medium">{message}</p>
    </div>
  );
}
