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

      const redirectParam =
        searchParams.get("redirect") ?? searchParams.get("redirectTo");
      const email = session.user?.email ?? "";

      let target: string;

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
