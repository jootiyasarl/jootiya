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
    <div className="min-h-screen bg-white flex font-sans overflow-hidden">
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

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 bg-[#0a0a0a] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-600/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10 text-left flex flex-col min-h-[600px] justify-center" dir="ltr">
          <div className="flex-grow flex flex-col justify-center space-y-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-4 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Retour à la connexion</span>
            </Link>

            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter">Mot de passe oublié</h1>
              <p className="text-zinc-400 text-lg font-medium">Entrez votre email pour réinitialiser</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-200 leading-tight">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-200 leading-tight">{success}</p>
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
                  className="h-14 px-6 rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-base font-medium"
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
          <div className="pt-12 border-t border-zinc-900/50 flex items-center justify-between opacity-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">J</span>
              </div>
            </div>
            <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
