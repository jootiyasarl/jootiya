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
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
        // Default home for regular users
        target = "/dashboard";
      }

      router.replace(target);
    };

    void checkSessionAndRedirect();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return null;
}
