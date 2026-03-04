import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ShieldCheck, ChevronLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Jootiya",
};

async function forgotPasswordAction(formData: FormData) {
  "use server";

  const email = formData.get("email")?.toString();

  if (!email) {
    redirect("/forgot-password?error=Veuillez entrer votre email");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?success=Un e-mail de réinitialisation قد تم إرساله.");
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className="h-screen w-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#fdfbf7] items-center justify-center p-12">
        <div className="max-w-md w-full">
          <svg viewBox="0 0 400 400" className="w-full h-full text-zinc-800" fill="none">
            <path d="M100 200 Q200 100 300 200 T100 300" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
            <rect x="150" y="150" width="100" height="100" rx="20" stroke="currentColor" strokeWidth="2" />
            <path d="M180 200 H220 M200 180 V220" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Right Side: Reset Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 h-full overflow-hidden">
        <div className="w-full max-w-md space-y-8 text-left flex flex-col justify-center h-full" dir="ltr">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Réinitialisation</h1>
            <p className="text-zinc-500 font-medium">Entrez votre email pour recevoir un lien</p>
          </div>

          <div className="flex-grow flex flex-col justify-center space-y-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all mb-4 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Retour à la connexion</span>
            </Link>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-600 leading-tight">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-600 leading-tight">{success}</p>
              </div>
            )}

            <form action={forgotPasswordAction} className="space-y-5">
              <div className="space-y-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Votre adresse e-mail"
                  required
                  className="h-14 px-6 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base font-bold"
                />
              </div>

              <div className="pt-4">
                <SubmitButton
                  label="Envoyer le lien"
                  loadingLabel="Envoi en cours..."
                  className="w-full h-14 text-lg font-black rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg transition-all active:scale-[0.98]"
                />
              </div>
            </form>
          </div>

          {/* Branding removed as requested */}
          {/* Navigation Links */}
          <div className="pt-10 border-t border-zinc-100 flex items-center justify-between">
            <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all mb-4 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Retour à la connexion</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
