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
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jootiya.com'}/marketplace`,
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

  // Handle session correctly for Next.js Server Components
  if (data.session) {
    await setAuthSession(data.session);
    redirect("/marketplace");
  } else if (user && !error) {
    // If no session but user created (e.g. email confirmation enabled or delay in session sync)
    // We try to sign in immediately since we have the credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: virtualEmail,
      password: trimmedPassword,
    });

    if (!signInError && signInData.session) {
      await setAuthSession(signInData.session);
      redirect("/marketplace");
    }
  }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="h-screen w-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side: Brand Experience */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#fdfbf7] items-center justify-center p-12 relative border-r border-zinc-100">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-md w-full relative z-10 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4 text-left" dir="ltr">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-widest">
              Plateforme Premium
            </div>
            <h2 className="text-6xl font-black text-zinc-900 leading-none tracking-tighter">
              Vendez plus vite sur <span className="text-orange-500">Jootiya.</span>
            </h2>
            <p className="text-xl text-zinc-600 font-medium leading-relaxed">
              La marketplace marocaine réinventée pour une expérience fluide و sécurisée.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
              <p className="text-2xl font-black text-zinc-900">10k+</p>
              <p className="text-sm text-zinc-500 font-bold uppercase">Annonces</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
              <p className="text-2xl font-black text-zinc-900">24/7</p>
              <p className="text-sm text-zinc-500 font-bold uppercase">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 relative overflow-hidden h-full">
        <div className="w-full max-w-md space-y-8 relative z-10 text-left flex flex-col justify-center" dir="ltr">
          <div className="flex-grow flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-zinc-900 tracking-tighter">Inscription</h1>
              <p className="text-zinc-500 text-lg font-medium">Créer un compte professionnel</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/5 p-4 border border-red-500/10 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-bold text-red-600 leading-tight">{error}</p>
              </div>
            )}

            <form action={registerAction} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="06/07..."
                  required
                  className="h-14 px-6 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email (Optionnel)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  className="h-14 px-6 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-14 px-6 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
                />
              </div>

              <div className="pt-4">
                <SubmitButton
                  label="Créer mon compte"
                  loadingLabel="Création..."
                  className="w-full h-14 text-lg font-black rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                />
              </div>
            </form>

            <div className="pt-4 text-center">
              <p className="text-zinc-500 text-sm font-medium">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-zinc-900 hover:text-orange-500 font-bold transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          <div className="pt-10 border-t border-zinc-100 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
            <span className="text-[10px] font-bold text-zinc-300"> 2024 JOOTIYA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
