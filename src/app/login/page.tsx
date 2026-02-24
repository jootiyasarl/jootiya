import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient, setAuthSession } from "@/lib/supabase-server";
import { ShieldCheck, Mail, Lock, ChevronLeft, Phone } from "lucide-react";

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

  await setAuthSession(data.session);
  redirect(redirectTo);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, redirectTo } = await searchParams;

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dir-rtl text-right" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform rotate-180" />
          <span className="text-sm font-bold">العودة للرئيسية</span>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-orange-600 mb-2">JOOTIYA</h1>
        <h2 className="text-3xl font-bold text-zinc-900">تسجيل الدخول</h2>
        <p className="mt-2 text-zinc-500 text-sm">مرحباً بك مجدداً في جوتية</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4">
        <Card className="border-none shadow-2xl shadow-zinc-200/50 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-zinc-200/50">
          <CardContent className="p-8 sm:p-10">
            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold text-red-700 leading-tight">{error}</p>
              </div>
            )}
            {message && (
              <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-700 leading-tight">{message}</p>
              </div>
            )}

            <form action={loginAction} className="space-y-5">
              <input type="hidden" name="redirectTo" value={redirectTo || ""} />
              
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-bold text-zinc-700 mr-1">رقم الهاتف أو الإيميل</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="06XXXXXXXX / exemple@mail.com"
                    required
                    className="h-12 pr-11 text-left text-sm rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-zinc-700 mr-1">كلمة السر</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-12 pr-11 text-left text-sm rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              <SubmitButton
                label="تسجيل الدخول"
                loadingLabel="جاري الدخول..."
                className="w-full h-12 text-sm font-bold rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all active:scale-[0.98] mt-2"
              />
            </form>

            <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
              <p className="text-sm text-zinc-500">
                ليس لديك حساب؟{' '}
                <Link href="/register" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
                  أنشئ حساباً جديداً
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[11px] text-zinc-400">
          بالدخول للموقع، أنت توافق على <Link href="/terms" className="underline hover:text-zinc-600">شروط الاستخدام</Link> و <Link href="/privacy" className="underline hover:text-zinc-600">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  );
}
