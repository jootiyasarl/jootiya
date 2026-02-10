import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { LoginRedirectHandler } from "@/components/auth/LoginRedirectHandler"; // Ensure this handles client logic appropriately

export const metadata: Metadata = {
  title: "Login | Jootiya",
};

interface LoginPageProps {
  searchParams?: {
    redirect?: string;
    redirectTo?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectParam = searchParams?.redirect ?? searchParams?.redirectTo;

  // Note: searchParams is synchronous here but handling it safely is good. 
  // Next.js 15+ might make searchParams async, but for now 14/15 usage:
  const showPostAdMessage =
    typeof redirectParam === "string" &&
    (redirectParam.startsWith("/marketplace/post") ||
      redirectParam.startsWith("/dashboard/ads/create"));

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <Suspense fallback={null}>
        <LoginRedirectHandler />
      </Suspense>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-6">
          {/* Logo could go here, text for now */}
          <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-indigo-600 bg-clip-text text-transparent">
            JOOTIYA
          </span>
        </Link>

        <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Bon retour
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Connectez-vous à votre compte
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/5 ring-1 ring-black/5 sm:rounded-2xl sm:px-10 dark:bg-zinc-900/70 dark:ring-white/10">

          {showPostAdMessage && (
            <div className="mb-6 rounded-xl bg-blue-50/80 p-4 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Vous devez vous connecter pour publier une annonce.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <Suspense fallback={<div className="h-10 bg-gray-200 rounded animate-pulse" />}>
                <GoogleLoginButton />
              </Suspense>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900">
                  Accès sécurisé
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              En vous connectant, vous acceptez nos <Link href="/terms" className="underline">Conditions d'utilisation</Link> et notre <Link href="/privacy" className="underline">Politique de confidentialité</Link>.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Vous n'avez pas de compte ?{' '}
          <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400">
            Créez-en un gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
