"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, setAuthSession } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

const otpRateMap = new Map<string, { count: number; resetAt: number }>();
const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MS = 15 * 60 * 1000;

function isOtpRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = otpRateMap.get(key);
  if (!entry) {
    otpRateMap.set(key, { count: 1, resetAt: now + OTP_WINDOW_MS });
    return false;
  }
  if (now > entry.resetAt) {
    otpRateMap.set(key, { count: 1, resetAt: now + OTP_WINDOW_MS });
    return false;
  }
  entry.count++;
  if (entry.count > OTP_MAX_ATTEMPTS) {
    return true;
  }
  return false;
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export async function verifyOtpAction(formData: FormData) {
  const emailRaw = formData.get("email");
  const tokenRaw = formData.get("token");
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard/ads/create";

  if (typeof emailRaw !== "string" || typeof tokenRaw !== "string") {
    redirect("/login?error=" + encodeURIComponent("Données invalides."));
  }

  const email = emailRaw.trim().toLowerCase();
  const token = tokenRaw.trim();

  if (!email || !token) {
    redirect("/login?error=" + encodeURIComponent("Veuillez entrer le code."));
  }

  if (isOtpRateLimited(email)) {
    redirect("/login?error=" + encodeURIComponent("Trop de tentatives. Veuillez demander un nouveau code."));
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.session) {
    console.error("OTP verification error:", error);
    redirect(
      "/verify?email=" +
        encodeURIComponent(email) +
        "&redirectTo=" +
        encodeURIComponent(redirectTo) +
        "&error=" +
        encodeURIComponent("Code incorrect ou expiré. Veuillez réessayer.")
    );
  }

  await setAuthSession(data.session);

  const user = data.session.user;
  const adminClient = getAdminClient();
  if (adminClient) {
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await adminClient.from("profiles").insert({
        id: user.id,
        email: email,
        role: "seller",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }
  }

  if (email === "jootiyasarl@gmail.com") {
    redirect("/admin");
  }

  redirect(redirectTo);
}

export async function resendOtpAction(formData: FormData) {
  const emailRaw = formData.get("email");
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard/ads/create";

  if (typeof emailRaw !== "string" || !emailRaw.trim()) {
    redirect("/login?error=" + encodeURIComponent("Adresse e-mail manquante."));
  }

  const email = emailRaw.trim().toLowerCase();

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    const msg = error.message?.includes("rate limit")
      ? "Trop de demandes. Veuillez patienter une minute."
      : "Impossible de renvoyer le code.";
    redirect("/verify?email=" + encodeURIComponent(email) + "&redirectTo=" + encodeURIComponent(redirectTo) + "&error=" + encodeURIComponent(msg));
  }

  redirect("/verify?email=" + encodeURIComponent(email) + "&redirectTo=" + encodeURIComponent(redirectTo) + "&message=" + encodeURIComponent("Un nouveau code a été envoyé."));
}
