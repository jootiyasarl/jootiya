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
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 dir-rtl text-right font-sans" dir="rtl">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-zinc-800/20 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 text-center sm:text-right">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-all mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform rotate-180" />
          <span className="text-sm font-bold">العودة للرئيسية</span>
        </Link>
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 rotate-3 group-hover:rotate-0 transition-transform">
            <span className="text-white font-black text-2xl tracking-tighter">J</span>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black tracking-tighter text-white">JOOTIYA</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Authentification</p>
          </div>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">تسجيل الدخول</h2>
        <p className="text-zinc-400 text-sm font-medium">مرحباً بك مجدداً في سوقك المفضل</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[460px] relative z-10 px-4">
        <Card className="border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-8 sm:p-12">
            {error && (
              <div className="mb-8 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold text-red-400 leading-tight">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="mb-8 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-100 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-400 leading-tight">{message}</p>
              </div>
            )}

            <form action={loginAction} className="space-y-6">
              <input type="hidden" name="redirectTo" value={redirectTo || ""} />
              
              <div className="space-y-3">
                <Label htmlFor="identifier" className="text-xs font-black uppercase tracking-widest text-zinc-500 mr-1 text-right block">رقم الهاتف أو الإيميل</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="06XXXXXXXX / email@example.com"
                    required
                    className="h-14 pr-12 text-left text-sm rounded-2xl bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-zinc-500 text-right">كلمة السر</Label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-orange-500 hover:text-orange-400 transition-colors">
                    نسيت كلمة السر؟
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-14 pr-12 text-left text-sm rounded-2xl bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              <SubmitButton
                label="تسجيل الدخول"
                loadingLabel="جاري التحقق..."
                className="w-full h-14 text-sm font-black rounded-2xl bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-900/20 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest"
              />
            </form>

            <div className="mt-10 pt-8 border-t border-zinc-800/50 text-center">
              <p className="text-sm text-zinc-500 font-medium">
                ليس لديك حساب؟{' '}
                <Link href="/register" className="font-black text-orange-500 hover:text-orange-400 transition-colors">
                  أنشئ حساباً مجانياً
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-loose px-8">
          بالدخول للموقع، أنت توافق على <Link href="/terms" className="text-zinc-400 underline decoration-zinc-800 hover:text-white transition-colors">شروط الاستخدام</Link> و <Link href="/privacy" className="text-zinc-400 underline decoration-zinc-800 hover:text-white transition-colors">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  );
}
