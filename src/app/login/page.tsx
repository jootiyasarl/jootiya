import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { LoginRedirectHandler } from "@/components/auth/LoginRedirectHandler";

export const metadata: Metadata = {
  title: "Login | Jootiya",
};

interface LoginPageProps {
  searchParams?: {
    redirect?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirect = searchParams?.redirect;
  const showPostAdMessage =
    typeof redirect === "string" && redirect.startsWith("/create-ad");

  return (
    <div className="min-h-screen bg-zinc-50">
      <Suspense fallback={null}>
        <LoginRedirectHandler />
      </Suspense>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16">
        <div className="mb-10 md:mb-0 md:flex-1">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            دخول بسيط وآمن إلى Jootiya
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            سجّل الدخول إلى حسابك
          </h1>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            استخدم حسابك على Google للوصول إلى إعلاناتك ولوحة التحكم بسهولة وأمان.
          </p>
        </div>

        <div className="md:flex-1">
          <Card className="border bg-white">
            <CardHeader className="flex flex-col gap-1 px-4 pt-4">
              <h2 className="text-sm font-semibold text-zinc-900">
                تسجيل الدخول
              </h2>
              <p className="text-xs text-zinc-500">
                تسجيل الدخول يتم حصرياً عبر حساب Google الخاص بك.
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {showPostAdMessage ? (
                <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  يجب تسجيل الدخول باستخدام Google لنشر إعلان
                </div>
              ) : null}

              <Suspense fallback={null}>
                <div className="mt-4 flex justify-center">
                  <GoogleLoginButton />
                </div>
              </Suspense>

              <p className="mt-4 text-center text-xs text-zinc-500">
                لا تملك حساباً على Jootiya؟{" "}
                <Link
                  href="/register"
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                >
                  أنشئ حساباً جديداً
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
