import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
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
    authEmail = `${trimmedIdentifier}@jootiya.com`;
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
  
  // 2. Admin Check: if this is the admin, redirect to admin panel
  if (data.session.user.email === 'jootiyasarl@gmail.com') {
    console.log("Admin detected, forcing redirect to /admin");
    redirect("/admin");
  }

  // 3. For other users, redirect to the intended destination or shop
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
            <h2 className="text-4xl font-black text-zinc-900 leading-none tracking-tighter">
              Vendez plus vite sur <span className="text-orange-500 text-5xl">Jootiya.</span>
            </h2>
          </div>

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

      {/* Right Side: Clean Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 relative h-full overflow-hidden">
        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">
              Bon retour !
            </h1>
            <p className="text-zinc-500 font-medium">
              Connectez-vous pour gérer vos annonces et favoris.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <form action={loginAction} className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo || ""} />
            
            <div className="space-y-4">
              <div className="space-y-2 group">
                <label htmlFor="identifier" className="label text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Email ou Téléphone
                </label>
                <div className="relative">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="nom@exemple.com"
                    required
                    className="input input-bordered w-full h-14 px-5 text-base font-bold"
                  />
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-end px-1">
                  <label htmlFor="password" className="label text-xs font-black uppercase tracking-widest text-zinc-500">
                    Mot de passe
                  </label>
                  <Link href="/forgot-password" title="Réinitialiser" className="text-[11px] font-black text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-tight">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="input input-bordered w-full h-14 px-5 text-base font-bold"
                  />
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input 
                type="checkbox" 
                id="remember"
                className="checkbox checkbox-primary checkbox-sm" 
              />
              <label htmlFor="remember" className="text-sm text-zinc-500 font-bold cursor-pointer hover:text-zinc-700 transition-colors select-none">Rester connecté</label>
            </div>

            <div className="pt-2">
              <SubmitButton
                label="Connexion instantanée"
                loadingLabel="Vérification..."
                className="btn btn-primary w-full h-14 text-base font-black"
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
          </div>
        </div>
      </div>
    </div>
  );
}
