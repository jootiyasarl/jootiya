"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Connexion en cours...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = queryParams.get("code");

        let session = null;

        if (accessToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            console.error("Set session error:", error.message);
          }

          session = data.session;
        }

        if (!session && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Exchange code error:", error.message);
          }

          session = data.session;
        }

        if (!session) {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        }

        if (!session) {
          setMessage("Session introuvable. Redirection...");
          window.location.replace("/login?error=session_missing");
          return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);

        try {
          const res = await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session }),
            signal: controller.signal,
          });

          if (!res.ok) {
            console.error("Set session API error:", await res.text());
          }
        } catch (error) {
          console.error("Set session API failed:", error);
        } finally {
          window.clearTimeout(timeout);
        }

        window.location.replace("/marketplace/post");
      } catch (err) {
        console.error("Callback error:", err);
        window.location.replace("/marketplace/post");
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      <p className="text-zinc-600 font-medium">{message}</p>
    </div>
  );
}
