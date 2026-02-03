"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function LoginRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isActive = true;

    const checkSessionAndRedirect = async () => {
      let session = null;

      // Poll a few times in case Supabase hasn't finished restoring
      // the session immediately after returning from Google OAuth.
      for (let attempt = 0; attempt < 10; attempt++) {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!isActive) {
          return;
        }

        if (currentSession) {
          session = currentSession;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (!isActive || !session) return;

      const email = session.user?.email ?? "";
      const userId = session.user?.id;

      if (!userId) return;

      try {
        const desiredRole =
          email === "jootiyasarl@gmail.com" ? "admin" : "seller";

        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", userId)
          .maybeSingle();

        if (!profileError) {
          if (!existingProfile) {
            await supabase.from("profiles").insert({
              id: userId,
              email,
              role: desiredRole,
            });
          } else {
            const currentRole = (existingProfile.role ?? "").toString().trim();

            if (currentRole !== desiredRole) {
              await supabase
                .from("profiles")
                .update({ role: desiredRole })
                .eq("id", userId);
            }
          }
        }
      } catch (error) {
        console.error("Failed to ensure user profile", error);
      }

      const redirectParam =
        searchParams.get("redirect") ?? searchParams.get("redirectTo");

      let target: string;

      // Sync client session to server cookies so that middleware
      // (which reads sb-access-token from cookies) recognizes the user.
      try {
        await fetch("/api/auth/set-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session }),
        });
      } catch (error) {
        console.error("Failed to sync auth session", error);
      }

      if (redirectParam && redirectParam.startsWith("/")) {
        // Explicit redirect from query param always wins
        target = redirectParam;
      } else if (email === "jootiyasarl@gmail.com") {
        // Site owner / admin default home
        target = "/admin";
      } else {
        // Default home for regular users is now the main marketplace
        target = "/marketplace";
      }

      router.replace(target);
      router.refresh(); // Force refresh to update navbar session state
    };

    void checkSessionAndRedirect();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return null;
}
