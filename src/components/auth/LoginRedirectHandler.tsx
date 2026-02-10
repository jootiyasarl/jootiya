"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export function LoginRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"checking" | "syncing" | "failed">("checking");

  useEffect(() => {
    let isActive = true;

    const checkSessionAndRedirect = async () => {
      let session = null;

      // Poll a few times in case Supabase hasn't finished restoring
      // the session immediately after returning from Google OAuth.
      for (let attempt = 0; attempt < 15; attempt++) {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!isActive) return;

        if (currentSession) {
          session = currentSession;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (!isActive) return;

      if (!session) {
        setStatus("failed");
        // If no session after polling, probably failed auth
        // We let the user stay on login page to try again
        return;
      }

      setStatus("syncing");

      const email = session.user?.email ?? "";
      const userId = session.user?.id;

      if (!userId) return;

      // Ensure Profile exists
      try {
        const desiredRole = email === "jootiyasarl@gmail.com" ? "admin" : "seller";
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

      // Sync to server cookies
      try {
        await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session }),
        });
      } catch (error) {
        console.error("Failed to sync auth session", error);
      }

      const redirectParam = searchParams.get("redirect") ?? searchParams.get("redirectTo");
      let target: string;

      if (redirectParam && redirectParam.startsWith("/")) {
        target = redirectParam;
      } else if (email === "jootiyasarl@gmail.com") {
        target = "/admin";
      } else {
        target = "/marketplace";
      }

      router.replace(target);
      router.refresh();
    };

    void checkSessionAndRedirect();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  if (status === "failed") {
    return (
      <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100 text-center">
        فشل الاتصال بجوجل. يرجى المحاولة مرة أخرى.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin" />
        <Loader2 className="w-6 h-6 text-orange-500 absolute inset-0 m-auto animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {status === "checking" ? "جاري التحقق من الحساب..." : "جاري تحضير جلستك..."}
        </p>
        <p className="text-[10px] text-zinc-400 font-medium">سيتم توجيهك في ثوانٍ قليلة</p>
      </div>
    </div>
  );
}
