"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Simple in-memory rate limiter (per server instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

export async function sendOtpAction(formData: FormData) {
  const emailRaw = formData.get("email");
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard/ads/create";

  if (typeof emailRaw !== "string" || !emailRaw.trim()) {
    redirect("/login?error=" + encodeURIComponent("Veuillez entrer votre adresse e-mail."));
  }

  const email = emailRaw.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    redirect("/login?error=" + encodeURIComponent("Veuillez entrer un e-mail valide."));
  }

  if (isRateLimited(email)) {
    redirect("/login?error=" + encodeURIComponent("Trop de tentatives. Veuillez réessayer dans une heure."));
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("OTP send error:", error);
    const msg = error.message?.includes("rate limit")
      ? "Trop de demandes. Veuillez patienter une minute."
      : "Impossible d'envoyer le code. Veuillez réessayer.";
    redirect("/login?error=" + encodeURIComponent(msg));
  }

  redirect("/verify?email=" + encodeURIComponent(email) + "&redirectTo=" + encodeURIComponent(redirectTo));
}
