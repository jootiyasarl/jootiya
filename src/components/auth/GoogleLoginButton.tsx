"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export function GoogleLoginButton() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const redirect = searchParams.get("redirect") ?? searchParams.get("redirectTo");
      const origin = window.location.origin;

      const redirectTo = redirect
        ? `${origin}/login?redirect=${encodeURIComponent(redirect)}`
        : `${origin}/login`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Login error:", error.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="relative w-full inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-zinc-700 shadow-lg shadow-zinc-200/50 ring-1 ring-inset ring-zinc-100 hover:bg-zinc-50 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-orange-500 mr-3" />
      ) : (
        <span className="mr-3 flex-shrink-0">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </span>
      )}
      <span>{isLoading ? "تسجيل الدخول..." : "متابعة باستخدام جوجل"}</span>
    </button>
  );
}
