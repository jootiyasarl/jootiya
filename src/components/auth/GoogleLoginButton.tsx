"use client";

import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function GoogleLoginButton() {
  const searchParams = useSearchParams();

  const handleGoogleLogin = async () => {
    const redirect = searchParams.get("redirect");
    const origin = window.location.origin;

    const redirectTo = redirect
      ? `${origin}/login?redirect=${encodeURIComponent(redirect)}`
      : `${origin}/login`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
    >
      الدخول باستخدام Google
    </button>
  );
}
