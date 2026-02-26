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
  title: "تسجيل الدخول | Jootiya",
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
    params.set("error", "يرجى إدخال رقم الهاتف أو الإيميل وكلمة السر.");
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
    params.set("error", "بيانات الدخول غير صحيحة.");
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
    <div className="min-h-screen bg-white flex font-sans overflow-hidden">
      {/* Left Side: Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#fdfbf7] items-center justify-center p-12 relative">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-left-8 duration-1000">
          {/* A professional line-art style illustration placeholder */}
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

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 bg-[#1a4d43] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10 text-left" dir="ltr">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-white tracking-tight">Login</h1>
            <p className="text-zinc-300/80 text-lg font-medium">I'm a professional</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-200 leading-tight">{error}</p>
            </div>
          )}

          <form action={loginAction} className="space-y-5">
            <input type="hidden" name="redirectTo" value={redirectTo || ""} />
            
            <div className="space-y-1">
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Email address"
                required
                className="h-14 px-6 rounded-xl bg-[#245a50] border-none text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/50 transition-all text-base font-medium"
              />
            </div>

            <div className="space-y-1">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
                className="h-14 px-6 rounded-xl bg-[#245a50] border-none text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500/50 transition-all text-base font-medium"
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-none bg-[#245a50] text-orange-600 focus:ring-offset-[#1a4d43]" 
              />
              <label htmlFor="remember" className="text-sm text-zinc-300 font-medium">Keep me logged in</label>
            </div>

            <div className="pt-4">
              <SubmitButton
                label="Log in"
                loadingLabel="Logging in..."
                className="w-full h-14 text-lg font-bold rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg shadow-orange-950/20 transition-all active:scale-[0.98]"
              />
            </div>

            <div className="text-center pt-2">
              <Link href="/forgot-password" title="Réinitialiser" className="text-sm font-medium text-orange-500/80 hover:text-orange-400 transition-colors underline-offset-4 hover:underline">
                Forget password?
              </Link>
            </div>
          </form>

          <div className="pt-8 text-center">
            <p className="text-zinc-400 text-sm font-medium">
              Don't have an account?{' '}
              <Link href="/register" className="text-white hover:text-orange-400 font-bold transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}
