import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import {
  createSupabaseServerClient,
  getProfileRole,
  setAuthSession,
} from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Login | Jootiya",
};

interface LoginPageProps {
  searchParams: {
    redirectTo?: string;
    error?: string;
    message?: string;
  };
}

async function loginAction(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  const safeRedirectTo =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : undefined;

  if (typeof email !== "string" || typeof password !== "string") {
    const params = new URLSearchParams();
    params.set("error", "Please enter both email and password.");
    if (safeRedirectTo) params.set("redirectTo", safeRedirectTo);
    redirect(`/login?${params.toString()}`);
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    const params = new URLSearchParams();
    params.set("error", "Please enter both email and password.");
    if (safeRedirectTo) params.set("redirectTo", safeRedirectTo);
    redirect(`/login?${params.toString()}`);
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  if (error || !data.session || !data.user) {
    const params = new URLSearchParams();
    params.set("error", "Invalid email or password.");
    if (safeRedirectTo) params.set("redirectTo", safeRedirectTo);
    redirect(`/login?${params.toString()}`);
  }

  await setAuthSession(data.session);

  const role = await getProfileRole(data.user.id);

  let target = "/dashboard";

  if (role === "admin" || role === "super_admin") {
    target = "/admin";
  } else if (role === "seller") {
    target = "/dashboard";
  }

  if (safeRedirectTo) {
    if (role === "seller" && safeRedirectTo.startsWith("/dashboard")) {
      target = safeRedirectTo;
    }
    if (
      (role === "admin" || role === "super_admin") &&
      safeRedirectTo.startsWith("/admin")
    ) {
      target = safeRedirectTo;
    }
  }

  redirect(target);
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const message =
    typeof searchParams.message === "string" ? searchParams.message : undefined;
  const redirectTo =
    typeof searchParams.redirectTo === "string"
      ? searchParams.redirectTo
      : undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16">
        <div className="mb-10 md:mb-0 md:flex-1">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            Secure marketplace access
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Sign in to your Jootiya account
          </h1>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            Use your email and password to access a secure seller or admin
            dashboard powered by Supabase Auth.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Encrypted sessions with HTTP-only cookies.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>No password hints or email leaks in error messages.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Mobile-friendly login for busy sellers.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Designed for both admins and professional sellers.</p>
            </div>
          </div>
        </div>

        <div className="md:flex-1">
          <Card className="border bg-white">
            <CardHeader className="flex flex-col gap-1 px-4 pt-4">
              <h2 className="text-sm font-semibold text-zinc-900">Login</h2>
              <p className="text-xs text-zinc-500">
                Enter your email and password to access your dashboard.
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {error ? (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {message}
                </div>
              ) : null}

              <form className="mt-2 space-y-4" action={loginAction}>
                {redirectTo ? (
                  <input
                    type="hidden"
                    name="redirectTo"
                    value={redirectTo}
                  />
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-zinc-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-zinc-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    minLength={8}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <SubmitButton
                  label="Sign in"
                  loadingLabel="Signing in..."
                  className="mt-2 w-full text-xs"
                />
              </form>

              <p className="mt-4 text-center text-xs text-zinc-500">
                New to Jootiya?{" "}
                <Link
                  href="/register"
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                >
                  Create an account
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
