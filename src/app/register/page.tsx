import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient, setAuthSession } from "@/lib/supabase-server";
import { UserPlus, ShieldCheck, Mail, Lock, ChevronLeft, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Inscription | Jootiya",
};

interface RegisterPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

async function registerAction(formData: FormData) {
  "use server";

  const phone = formData.get("phone");
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof phone !== "string" || typeof password !== "string") {
    const params = new URLSearchParams();
    params.set("error", "Veuillez entrer votre numéro de téléphone et mot de passe.");
    redirect(`/register?${params.toString()}`);
  }

  const trimmedPhone = phone.trim();
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedPassword = password.trim();

  // Validate phone format (06 or 07 followed by 8 digits)
  if (!/^(06|07)\d{8}$/.test(trimmedPhone)) {
    const params = new URLSearchParams();
    params.set("error", "Le numéro doit commencer par 06 ou 07 (10 chiffres).");
    redirect(`/register?${params.toString()}`);
  }

  if (trimmedPassword.length < 8) {
    const params = new URLSearchParams();
    params.set("error", "Le mot de passe doit faire au moins 8 caractères.");
    redirect(`/register?${params.toString()}`);
  }

  const supabase = createSupabaseServerClient();

  // Check if email already exists in profiles
  if (trimmedEmail) {
    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existingEmail) {
      const params = new URLSearchParams();
      params.set("error", "Cette adresse e-mail est déjà utilisée par un autre compte.");
      redirect(`/register?${params.toString()}`);
    }
  }

  // For Hybrid Auth, we use the phone as the email identifier in Supabase Auth if needed,
  // or we create a custom user. Since the user wants to gather email optionally,
  // we'll use a virtual email for Supabase Auth based on the phone number.
  // Using .com instead of .local to ensure Supabase accepts it as a valid email domain.
  // NOTE: If you get "email rate limit exceeded", it's because Supabase default SMTP 
  // has a limit of 3 emails per hour. You should configure a custom SMTP (SendGrid/Resend) 
  // or disable email confirmation in Supabase Dashboard.
  const virtualEmail = `${trimmedPhone}@jootiya.com`;

  const { data, error } = await supabase.auth.signUp({
    email: virtualEmail,
    password: trimmedPassword,
    options: {
      data: {
        phone: trimmedPhone,
        real_email: trimmedEmail,
      }
    }
  });

  if (error || !data.user) {
    const params = new URLSearchParams();
    params.set("error", error?.message ?? "فشل إنشاء الحساب.");
    redirect(`/register?${params.toString()}`);
  }

  const user = data.user;

  // Create profile
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        phone: trimmedPhone,
        email: trimmedEmail || null,
        role: "seller",
      },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error("Profile creation error:", profileError);
    const params = new URLSearchParams();
    params.set("error", `Erreur profil: ${profileError.message}`);
    redirect(`/register?${params.toString()}`);
  }

  if (data.session) {
    await setAuthSession(data.session);
    redirect("/marketplace");
  }

  redirect("/login?message=Compte créé avec succès. Vous pouvez maintenant vous connecter.");
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen bg-white flex font-sans overflow-hidden">
      {/* Left Side: Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#fdfbf7] items-center justify-center p-12 relative">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="relative aspect-square w-full">
            <svg viewBox="0 0 400 400" className="w-full h-full text-zinc-800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 300 L150 100 L300 120 L250 320 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M180 150 Q220 130 240 170" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="210" cy="110" r="25" stroke="currentColor" strokeWidth="2" />
              <path d="M120 280 L280 280" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              <rect x="140" y="160" width="100" height="120" rx="10" stroke="currentColor" strokeWidth="2" />
              <path d="M160 190 H220 M160 210 H220 M160 230 H190" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 bg-[#0a0a0a] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-600/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10 text-left flex flex-col min-h-[600px] justify-center" dir="ltr">
          <div className="flex-grow flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-white tracking-tighter">Inscription</h1>
              <p className="text-zinc-400 text-lg font-medium">Créer un compte professionnel</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-200 leading-tight">{error}</p>
              </div>
            )}

            <form action={registerAction} className="space-y-5">
              <div className="space-y-1">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Numéro de téléphone (06/07...)"
                  required
                  className="h-14 px-6 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-base font-medium"
                />
              </div>

              <div className="space-y-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Adresse e-mail (optionnel)"
                  className="h-14 px-6 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-base font-medium"
                />
              </div>

              <div className="space-y-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mot de passe (8+ caractères)"
                  required
                  className="h-14 px-6 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-base font-medium"
                />
              </div>

              <div className="pt-4">
                <SubmitButton
                  label="Créer mon compte"
                  loadingLabel="Création en cours..."
                  className="w-full h-14 text-lg font-black rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg shadow-orange-950/20 transition-all active:scale-[0.98]"
                />
              </div>
            </form>

            <div className="pt-4 text-center">
              <p className="text-zinc-500 text-sm font-medium">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-white hover:text-orange-400 font-bold transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Branding removed as requested */}
          <div className="pt-12 border-t border-zinc-900/50 flex items-center justify-end opacity-50">
            <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>

  );
}
