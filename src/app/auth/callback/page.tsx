"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Connexion en cours...");

  useEffect(() => {
    let completed = false;

    const finishLogin = async (session: any) => {
      if (completed) return;
      completed = true;

      try {
        if (session?.access_token) {
          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session }),
          });
        }
      } catch (error) {
        console.error("Set session API failed:", error);
      }

      window.location.replace("/marketplace/post");
    };

    const handleAuth = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = queryParams.get("code");

        if (accessToken) {
          const { data } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (data.session) {
            await finishLogin(data.session);
            return;
          }
        }

        if (code) {
          const { data } = await supabase.auth.exchangeCodeForSession(code);

          if (data.session) {
            await finishLogin(data.session);
            return;
          }
        }

        const { data } = await supabase.auth.getSession();

        if (data.session) {
          await finishLogin(data.session);
          return;
        }
      } catch (err) {
        console.error("Callback error:", err);
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        finishLogin(session);
      }
    });

    handleAuth();

    const retry = window.setTimeout(handleAuth, 1000);
    const fallback = window.setTimeout(() => {
      if (!completed) {
        setMessage("Redirection vers la page de publication...");
        window.location.replace("/marketplace/post");
      }
    }, 3000);

    return () => {
      window.clearTimeout(retry);
      window.clearTimeout(fallback);
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      <p className="text-zinc-600 font-medium">{message}</p>
    </div>
  );
}
