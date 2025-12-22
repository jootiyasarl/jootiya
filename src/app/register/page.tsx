"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "buyer" | "seller";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleEmailRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && !data.session) {
        setMessage(
          "Check your email to confirm your account. Once confirmed, you can sign in.",
        );
      } else if (data.session) {
        setMessage("Account created. Redirecting...");
        router.push("/dashboard/profile");
      } else {
        setMessage("Account created. You can now sign in.");
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleRegister() {
    setError(null);
    setMessage(null);
    setIsGoogleLoading(true);

    try {
      const origin = window.location.origin;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to start Google sign-in.");
      setIsGoogleLoading(false);
    }
  }

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
            Join Jootiya to buy and sell safely. We use secure authentication
            powered by Supabase and modern best practices.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Encrypted authentication and OAuth with Google.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>No spam. You control your notifications.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Designed for both buyers and professional sellers.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Backed by modern infrastructure and best practices.</p>
            </div>
          </div>
        </div>

        <div className="md:flex-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">
                Register
              </h2>
              <p className="text-xs text-zinc-500">
                Create your account to start using the marketplace.
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

            <form
              onSubmit={handleEmailRegister}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="role">I want to use Jootiya as</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as Role)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting || isGoogleLoading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  disabled={isSubmitting || isGoogleLoading}
                />
              </div>

              <div className="flex items-start gap-2 text-xs text-zinc-600">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  disabled={isSubmitting || isGoogleLoading}
                  className="mt-0.5 h-3.5 w-3.5 rounded border border-zinc-300 text-zinc-900"
                />
                <label
                  htmlFor="terms"
                  className="select-none"
                >
                  I agree to the
                  {" "}
                  <a
                    href="#"
                    className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                  >
                    Terms of Service
                  </a>
                  {" "}
                  and
                  {" "}
                  <a
                    href="#"
                    className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isGoogleLoading}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
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
              onClick={handleGoogleRegister}
              disabled={isSubmitting || isGoogleLoading}
            >
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
            </Button>

            <p className="mt-4 text-center text-xs text-zinc-500">
              Already have an account?
              {" "}
              <a
                href="#"
                className="font-medium text-zinc-900 underline-offset-4 hover:underline"
              >
                Sign in
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
