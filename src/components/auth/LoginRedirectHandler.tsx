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

      const redirectParam = searchParams.get("redirect");
      const target =
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : "/dashboard";

      router.replace(target);
    };

    void checkSessionAndRedirect();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return null;
}
