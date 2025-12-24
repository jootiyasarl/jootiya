"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const {
        data,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const normalized = signInError.message.toLowerCase();

        if (normalized.includes("invalid login credentials")) {
          setError("The email or password is incorrect.");
        } else {
          setError("Unable to sign you in. Please try again.");
          console.error(signInError);
        }

        return;
      }

      if (data.session) {
        setMessage("Signed in. Redirecting...");
        router.push(redirectTo);
      } else {
        setMessage("Signed in successfully.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setMessage(null);
    setIsGoogleLoading(true);

    try {
      const origin = window.location.origin;
      const redirectPath = redirectTo === "/" ? "" : redirectTo;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}${redirectPath}`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to start Google sign-in.");
      setIsGoogleLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setError("Enter your email first to reset your password.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsResetting(true);

    try {
      const origin = window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${origin}/reset-password`,
        },
      );

      if (resetError) {
        console.error(resetError);
      }

      setMessage(
        "If an account exists for this email, you will receive password reset instructions shortly.",
      );
    } catch (err) {
      console.error(err);
      setMessage(
        "If an account exists for this email, you will receive password reset instructions shortly.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  const isBusy = isSubmitting || isGoogleLoading || isResetting;

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
            Use your email and password or continue with Google. We never
            share your data and use secure authentication powered by Supabase.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Encrypted sessions and OAuth with Google.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>No password hints or email leaks in error messages.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Sign in from any device, stay in control.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Designed for both teams and professional sellers.</p>
            </div>
          </div>
        </div>

        <div className="md:flex-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Login</h2>
              <p className="text-xs text-zinc-500">
                Enter your credentials to access your marketplace dashboard.
              </p>
            </div>

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

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isBusy}
                    className="text-xs font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  disabled={isBusy}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isBusy}>
                {isSubmitting ? "Signing you in..." : "Continue"}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-2 text-[11px] text-zinc-400">
              <div className="h-px flex-1 bg-zinc-200" />
              <span>or continue with</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full text-xs"
              onClick={handleGoogleLogin}
              disabled={isBusy}
            >
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
            </Button>

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
          </div>
        </div>
      </div>
    </div>
  );
}
