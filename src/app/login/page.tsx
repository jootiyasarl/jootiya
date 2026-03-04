import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient, setAuthSession } from "@/lib/supabase-server";
import { ShieldCheck, Lock, ChevronLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion | Jootiya",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirectTo?: string;
  }>;
}

async function loginAction(formData: FormData) {
  "use server";

  const identifier = formData.get("identifier");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo")?.toString() || "/marketplace";

  if (typeof identifier !== "string" || typeof password !== "string") {
    const params = new URLSearchParams();
    params.set("error", "Veuillez entrer votre email/téléphone et mot de passe.");
    redirect(`/login?${params.toString()}`);
  }

  const trimmedIdentifier = identifier.trim();
  const trimmedPassword = password.trim();

  const supabase = createSupabaseServerClient();

  // Determine if identifier is phone or email
  let authEmail = trimmedIdentifier;
  if (/^(06|07)\d{8}$/.test(trimmedIdentifier)) {
    authEmail = `${trimmedIdentifier}@jootiya.local`;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: trimmedPassword,
  });

  if (error || !data.session) {
    const params = new URLSearchParams();
    params.set("error", "Identifiants incorrects.");
    redirect(`/login?${params.toString()}`);
  }

  // Set cookies for the session
  await setAuthSession(data.session);
  
  // 2. الفحص الذهبي: إذا كان هذا هو الأدمن، اقطرعه للمسار الصحيح فوراً
  if (data.session.user.email === 'jootiyasarl@gmail.com') {
    console.log("Admin detected, forcing redirect to /admin");
    redirect("/admin"); // ✅ استخدام مسار مطلق ومباشر
  }

  // 3. لبقية المستخدمين، اذهب للوجهة المطلوبة أو المتجر
  redirect(redirectTo);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, redirectTo } = await searchParams;

  return (
    <div className="h-screen w-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side: Modern Brand Experience */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#fdfbf7] items-center justify-center p-12 relative overflow-hidden border-r border-zinc-100">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-md w-full relative z-10 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-widest">
              Plateforme Premium
            </div>
            <h2 className="text-6xl font-black text-zinc-900 leading-none tracking-tighter">
              Vendez plus vite sur <span className="text-orange-500">Jootiya.</span>
            </h2>
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

      {/* Right Side: Clean Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 relative h-full overflow-hidden">
        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">
              Bon retour !
            </h1>
            <p className="text-zinc-500 font-medium">
              Connectez-vous pour gérer vos annonces و favoris.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-500/5 p-4 border border-red-500/10 flex gap-3 items-center animate-in shake duration-500">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          <form action={loginAction} className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo || ""} />
            
            <div className="space-y-4">
              <div className="space-y-2 group">
                <Label htmlFor="identifier" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 group-focus-within:text-orange-500 transition-colors">
                  Email ou Téléphone
                </Label>
                <div className="relative">
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="nom@exemple.com"
                    required
                    className="h-14 px-5 rounded-2xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
                  />
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-end px-1">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-zinc-500 group-focus-within:text-orange-500 transition-colors">
                    Mot de passe
                  </Label>
                  <Link href="/forgot-password" title="Réinitialiser" className="text-[11px] font-black text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-tight">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-14 px-5 rounded-2xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
                  />
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="peer appearance-none w-5 h-5 rounded-lg border-2 border-zinc-200 bg-zinc-50 checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer" 
                />
                <ShieldCheck className="absolute left-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <Label htmlFor="remember" className="text-sm text-zinc-500 font-bold cursor-pointer hover:text-zinc-700 transition-colors select-none">Rester connecté</Label>
            </div>

            <div className="pt-2">
              <SubmitButton
                label="Connexion instantanée"
                loadingLabel="Vérification..."
                className="w-full h-14 text-base font-black rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
              />
            </div>
          </form>

          <div className="pt-8 text-center">
            <p className="text-zinc-500 text-sm font-medium">
              Nouveau ici ?{' '}
              <Link href="/register" className="text-zinc-900 hover:text-orange-500 font-black transition-colors underline decoration-orange-500/30 underline-offset-4">
                Créer un compte gratuit
              </Link>
            </p>
          </div>

          {/* Navigation Links */}
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
