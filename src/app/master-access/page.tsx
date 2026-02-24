"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ShieldCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Admin Login error:", err.message);
      setError("حدث خطأ أثناء تسجيل الدخول. تأكد من استخدام حساب Gmail الصحيح.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dir-rtl text-right" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform rotate-180" />
          <span className="text-sm font-bold">العودة للرئيسية</span>
        </Link>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">JOOTIYA</h1>
        <h2 className="text-xl font-bold text-zinc-400">مركز التحكم الإداري</h2>
        <p className="mt-2 text-zinc-500 text-sm italic">دخول مقيد للمسؤولين فقط</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4">
        <Card className="border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/10">
          <CardContent className="p-8 sm:p-10">
            {error && (
              <div className="mb-6 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold text-red-400 leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-6 text-center">
              <p className="text-zinc-400 text-sm">سجل دخولك باستخدام بريد Google المعتمد للوصول للوحة التحكم</p>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="relative w-full inline-flex items-center justify-center rounded-2xl bg-white px-4 py-4 text-sm font-black text-black shadow-xl hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-orange-600 mr-3" />
                ) : (
                  <span className="ml-3 flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </span>
                )}
                <span>{isLoading ? "جاري التحقق..." : "الدخول باستخدام Google"}</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-zinc-950 text-zinc-600 uppercase tracking-widest">Master Access Only</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
