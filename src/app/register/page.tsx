import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient, setAuthSession } from "@/lib/supabase-server";
import { UserPlus, ShieldCheck, Mail, Lock, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "إنشاء حساب | جوتيا",
};

interface RegisterPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

async function registerAction(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    const params = new URLSearchParams();
    params.set("error", "يرجى إدخال البريد الإلكتروني وكلمة المرور.");
    redirect(`/register?${params.toString()}`);
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword || trimmedPassword.length < 8) {
    const params = new URLSearchParams();
    params.set(
      "error",
      "يرجى تقديم بريد إلكتروني صالح وكلمة مرور لا تقل عن 8 أحرف.",
    );
    redirect(`/register?${params.toString()}`);
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  if (error || !data.user) {
    const params = new URLSearchParams();
    params.set("error", error?.message ?? "فشل في إنشاء الحساب.");
    redirect(`/register?${params.toString()}`);
  }

  const user = data.user;

  // Ensure profile is created
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? trimmedEmail,
        role: "seller",
      },
      { onConflict: "id" },
    );

  if (profileError) {
    const params = new URLSearchParams();
    params.set("error", "فشل في حفظ ملفك الشخصي.");
    redirect(`/register?${params.toString()}`);
  }

  if (data.session) {
    await setAuthSession(data.session);
    redirect("/marketplace");
  }

  const params = new URLSearchParams();
  params.set(
    "message",
    "تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني لتأكيد التسجيل، ثم قم بتسجيل الدخول.",
  );
  redirect(`/login?${params.toString()}`);
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">العودة للرئيسية</span>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-orange-600 mb-2">JOOTIYA</h1>
        <h2 className="text-3xl font-bold text-zinc-900">إنشاء حساب جديد</h2>
        <p className="mt-2 text-zinc-500 text-sm">ابدأ البيع والشراء في أكبر سوق مغربي</p>
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

            <form action={registerAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-zinc-700 mr-1">البريد الإلكتروني</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@mail.com"
                    required
                    className="h-12 pr-11 text-sm rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-zinc-700 mr-1">كلمة المرور</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    minLength={8}
                    required
                    className="h-12 pr-11 text-sm rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 pr-1">يجب أن تتكون من 8 أحرف على الأقل</p>
              </div>

              <SubmitButton
                label="إنشاء الحساب"
                loadingLabel="جاري الإنشاء..."
                className="w-full h-12 text-sm font-bold rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all active:scale-[0.98] mt-2"
              />
            </form>

            <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
              <p className="text-sm text-zinc-500">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
                  سجل الدخول الآن
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Legal links */}
        <p className="mt-8 text-center text-[11px] text-zinc-400">
          من خلال إنشاء حساب، فإنك توافق على <Link href="/terms" className="underline hover:text-zinc-600">شروط الاستخدام</Link> و <Link href="/privacy" className="underline hover:text-zinc-600">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  );
}
