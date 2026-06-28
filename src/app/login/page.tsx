import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { createSupabaseServerClient, setAuthSession, setSellerSession } from "@/lib/supabase-server";
import { Lock, ChevronLeft, Mail, Store } from "lucide-react";

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
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard";

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

  // Determine the user's role (admin is the only special case here).
  const isAdmin = data.session.user.email === 'jootiyasarl@gmail.com';
  const role = isAdmin ? "admin" : "seller";

  // Persist cookies so the middleware and server helpers can verify the session.
  await setAuthSession(data.session);       // Supabase access/refresh tokens
  await setSellerSession(data.session, role); // Middleware cookies: session_token + user_role

  // 2. Admin Check: if this is the admin, redirect to admin panel
  if (isAdmin) {
    console.log("Admin detected, forcing redirect to /admin");
    redirect("/admin");
  }

  // 3. For sellers, redirect to the intended destination or the seller dashboard
  redirect(redirectTo);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, redirectTo } = await searchParams;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-zinc-100 p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-zinc-200/50 p-8 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-zinc-800" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 mb-2">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Espace Vendeur
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            Connectez-vous pour gérer vos annonces et booster vos ventes.
          </p>
        </div>

        {/* Error / Message */}
        {error && (
          <div className="rounded-2xl bg-red-500/5 p-4 border border-red-500/10 flex gap-3 items-center animate-in shake duration-500">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}
        {message && (
          <div className="rounded-2xl bg-green-500/5 p-4 border border-green-500/10 flex gap-3 items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-green-600">{message}</p>
          </div>
        )}

        {/* Google Login — primary CTA for sellers */}
        <div className="space-y-4">
          <GoogleLoginButton />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[11px] font-black uppercase tracking-widest text-zinc-400">
              ou
            </span>
          </div>
        </div>

        {/* Email / Phone Login Form */}
        <form action={loginAction} className="space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo || ""} />

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

          <SubmitButton
            label="Se connecter"
            loadingLabel="Vérification..."
            className="w-full h-14 text-base font-black rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98]"
          />
        </form>

        {/* Footer */}
        <div className="pt-2 text-center space-y-4">
          <p className="text-zinc-500 text-sm font-medium">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-zinc-900 hover:text-orange-500 font-black transition-colors underline decoration-orange-500/30 underline-offset-4">
              S&apos;inscrire
            </Link>
          </p>

          <Link href="/" className="group inline-flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
