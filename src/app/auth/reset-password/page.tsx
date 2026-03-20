import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ShieldCheck, Lock, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | Jootiya",
};

async function resetPasswordAction(formData: FormData) {
  "use server";

  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!password || !confirmPassword) {
    redirect("/auth/reset-password?error=Veuillez remplir tous les champs");
  }

  if (password !== confirmPassword) {
    redirect("/auth/reset-password?error=Les mots de passe ne correspondent pas");
  }

  if (password.length < 8) {
    redirect("/auth/reset-password?error=Le mot de passe doit faire au moins 8 caractères");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Votre mot de passe a été réinitialisé avec succès.");
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="h-screen w-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-[#fdfbf7] items-center justify-center p-12 relative overflow-hidden border-r border-zinc-100">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-md w-full relative z-10 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 text-left" dir="ltr">
          <h2 className="text-4xl font-black text-zinc-900 leading-none tracking-tighter">
            Sécurisez votre compte <span className="text-orange-500">Jootiya.</span>
          </h2>
          <p className="text-zinc-500 font-medium">Choisissez un nouveau mot de passe fort pour protéger vos annonces.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 relative h-full overflow-hidden">
        <div className="w-full max-w-sm space-y-6 relative z-10 text-left flex flex-col justify-center" dir="ltr">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Nouveau mot de passe</h1>
            <p className="text-zinc-500 font-medium">Entrez votre nouveau mot de passe ci-dessous.</p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-500/5 p-4 border border-red-500/10 flex gap-3 items-center animate-in shake duration-500">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          <form action={resetPasswordAction} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 group">
                <Label htmlFor="password" title="Mot de passe" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 group-focus-within:text-orange-500 transition-colors">
                  Nouveau mot de passe
                </Label>
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

              <div className="space-y-2 group">
                <Label htmlFor="confirmPassword" title="Confirmer" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 group-focus-within:text-orange-500 transition-colors">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-14 px-5 rounded-2xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
                  />
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton
                label="Mettre à jour"
                loadingLabel="Mise à jour..."
                className="w-full h-14 text-base font-black rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
              />
            </div>
          </form>

          <div className="pt-10 border-t border-zinc-100 flex items-center justify-between">
            <Link href="/login" className="group flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
