"use server";

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient, setAuthSession } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { ChevronLeft, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Vérification | Jootiya",
};

// In-memory rate limiter for OTP verification attempts
const otpRateMap = new Map<string, { count: number; resetAt: number }>();
const OTP_MAX_ATTEMPTS = 5;
const OTP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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

// Helper to create admin client for profile upsert (bypasses RLS)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

async function verifyOtpAction(formData: FormData) {
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

  // Rate limit OTP verification attempts
  if (isOtpRateLimited(email)) {
    redirect("/login?error=" + encodeURIComponent("Trop de tentatives. Veuillez demander un nouveau code."));
  }

  const supabase = createSupabaseServerClient();

  // Verify OTP
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

  // Set session cookies
  await setAuthSession(data.session);

  const user = data.session.user;

  // Check if profile exists; if not, create one
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

  // Admin check
  if (email === "jootiyasarl@gmail.com") {
    redirect("/admin");
  }

  redirect(redirectTo);
}

async function resendOtpAction(formData: FormData) {
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

interface VerifyPageProps {
  searchParams: Promise<{
    email?: string;
    redirectTo?: string;
    error?: string;
    message?: string;
  }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email, redirectTo, error, message } = await searchParams;

  if (!email) {
    redirect("/login?error=" + encodeURIComponent("Veuillez entrer votre adresse e-mail."));
  }

  return (
    <div className="h-screen w-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#fdfbf7] items-center justify-center p-12 relative border-r border-zinc-100">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-md w-full relative z-10 space-y-8">
          <h2 className="text-4xl font-black text-zinc-900 leading-none tracking-tighter">
            Vendez plus vite sur <span className="text-orange-500 text-5xl">Jootiya.</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="card bg-base-100 border border-zinc-200 shadow-sm p-4">
              <p className="text-2xl font-black text-zinc-900">10k+</p>
              <p className="text-sm text-zinc-500 font-bold uppercase">Annonces</p>
            </div>
            <div className="card bg-base-100 border border-zinc-200 shadow-sm p-4">
              <p className="text-2xl font-black text-zinc-900">24/7</p>
              <p className="text-sm text-zinc-500 font-bold uppercase">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 h-full">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Vérification</h1>
            <p className="text-zinc-500 font-medium">
              Entrez le code à 6 chiffres envoyé à{" "}
              <span className="text-zinc-900 font-black">{email}</span>
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex gap-3 items-start">
              <span className="text-red-500 text-lg">⚠</span>
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}
          {message && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex gap-3 items-start">
              <span className="text-emerald-500 text-lg">✓</span>
              <p className="text-sm font-bold text-emerald-600">{message}</p>
            </div>
          )}

          <form action={verifyOtpAction} className="space-y-5">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="redirectTo" value={redirectTo || "/dashboard/ads/create"} />

            <div className="space-y-2">
              <label htmlFor="token" className="label text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                Code de vérification
              </label>
              <div className="relative">
                <input
                  id="token"
                  name="token"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="123456"
                  required
                  autoComplete="one-time-code"
                  className="input input-bordered w-full h-14 px-5 text-center text-2xl font-black tracking-[0.3em]"
                />
                <KeyRound className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton
                label="Vérifier et se connecter"
                loadingLabel="Vérification..."
                className="btn btn-primary w-full h-14 text-lg font-black"
              />
            </div>
          </form>

          <form action={resendOtpAction} className="text-center">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="redirectTo" value={redirectTo || "/dashboard/ads/create"} />
            <SubmitButton
              label="Renvoyer le code"
              loadingLabel="Envoi..."
              className="text-sm font-bold text-zinc-500 hover:text-orange-500 transition-colors underline underline-offset-4"
            />
          </form>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <Link href="/login" className="group flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Changer l'e-mail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
