import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createSupabaseServerClient, setAuthSession } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Register | Jootiya",
};

interface RegisterPageProps {
  searchParams: {
    error?: string;
    message?: string;
  };
}

async function registerAction(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    const params = new URLSearchParams();
    params.set("error", "Please enter both email and password.");
    redirect(`/register?${params.toString()}`);
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword || trimmedPassword.length < 8) {
    const params = new URLSearchParams();
    params.set(
      "error",
      "Please provide a valid email and a password with at least 8 characters.",
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
    params.set("error", error?.message ?? "Failed to create account.");
    redirect(`/register?${params.toString()}`);
  }

  const user = data.user;

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
    params.set("error", "Failed to save your profile.");
    redirect(`/register?${params.toString()}`);
  }

  if (data.session) {
    await setAuthSession(data.session);
    redirect("/dashboard");
  }

  const params = new URLSearchParams();
  params.set(
    "message",
    "Account created. Please check your email to confirm your address, then sign in.",
  );
  redirect(`/login?${params.toString()}`);
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const message =
    typeof searchParams.message === "string" ? searchParams.message : undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16">
        <div className="mb-10 md:mb-0 md:flex-1">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            Marketplace SaaS onboarding
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Create your marketplace account
          </h1>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            Join Jootiya to buy and sell safely. Use your email to create a secure
            seller account powered by Supabase Auth.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Email + password authentication with modern security.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>No spam. You control your notifications.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Designed for professional sellers in Morocco.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Backed by modern infrastructure and best practices.</p>
            </div>
          </div>
        </div>

        <div className="md:flex-1">
          <Card className="border bg-white">
            <CardHeader className="flex flex-col gap-1 px-4 pt-4">
              <h2 className="text-sm font-semibold text-zinc-900">Register</h2>
              <p className="text-xs text-zinc-500">
                Create your seller account with email and password.
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

              <form className="mt-2 space-y-4" action={registerAction}>
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
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <SubmitButton
                  label="Create account"
                  loadingLabel="Creating account..."
                  className="mt-2 w-full text-xs"
                />
              </form>

              <p className="mt-4 text-center text-xs text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                >
                  Sign in
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
