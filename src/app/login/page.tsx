"use server";

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ChevronLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion | Jootiya",
};

// Simple in-memory rate limiter (per server instance)
// In production with multiple instances, use Redis or a DB table
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;        // 5 attempts per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

async function sendOtpAction(formData: FormData) {
  const emailRaw = formData.get("email");
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard/ads/create";

  if (typeof emailRaw !== "string" || !emailRaw.trim()) {
    redirect("/login?error=" + encodeURIComponent("Veuillez entrer votre adresse e-mail."));
  }

  const email = emailRaw.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    redirect("/login?error=" + encodeURIComponent("Veuillez entrer un e-mail valide."));
  }

  // Rate limiting by email + IP simplified (using email hash)
  if (isRateLimited(email)) {
    redirect("/login?error=" + encodeURIComponent("Trop de tentatives. Veuillez réessayer dans une heure."));
  }

  const supabase = createSupabaseServerClient();

  // Send OTP — creates user automatically if doesn't exist
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // Optional: set email redirect for confirmation link (not used for OTP)
    },
  });

  if (error) {
    console.error("OTP send error:", error);
    const msg = error.message?.includes("rate limit")
      ? "Trop de demandes. Veuillez patienter une minute."
      : "Impossible d'envoyer le code. Veuillez réessayer.";
    redirect("/login?error=" + encodeURIComponent(msg));
  }

  // Success → redirect to verify page with email
  redirect("/verify?email=" + encodeURIComponent(email) + "&redirectTo=" + encodeURIComponent(redirectTo));
}

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirectTo?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, redirectTo } = await searchParams;

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
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Connexion</h1>
            <p className="text-zinc-500 font-medium">
              Entrez votre e-mail pour recevoir un code de vérification.
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

          <form action={sendOtpAction} className="space-y-5">
            <input type="hidden" name="redirectTo" value={redirectTo || "/dashboard/ads/create"} />

            <div className="space-y-2">
              <label htmlFor="email" className="label text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@gmail.com"
                  required
                  autoComplete="email"
                  className="input input-bordered w-full h-14 px-5 text-base font-bold"
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton
                label="Continuer avec l'e-mail"
                loadingLabel="Envoi du code..."
                className="btn btn-primary w-full h-14 text-lg font-black"
              />
            </div>
          </form>

          <p className="text-xs text-zinc-400 text-center">
            Un code à 6 chiffres vous sera envoyé par e-mail.
          </p>

          <div className="pt-6 border-t border-zinc-100">
            <Link href="/" className="group flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
