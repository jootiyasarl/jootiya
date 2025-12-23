"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface OnboardingForm {
  name: string;
  phone: string;
  city: string;
}

export default function OnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState<OnboardingForm>({
    name: "",
    phone: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        // If session is missing for any reason, send the user back to login.
        if (!user) {
          router.replace("/login?redirect=/onboarding");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, city")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled && !profileError && profile) {
          setForm({
            name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            city: profile.city ?? "",
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load your profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be signed in to complete onboarding.");
      }

      const meta = (user.app_metadata as any) ?? {};
      const userMeta = (user.user_metadata as any) ?? {};
      const role = (meta.role ?? userMeta.role) ?? null;

      // Persist core profile information before sending the user to create their first ad.
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: form.name.trim(),
            phone: form.phone.trim() || null,
            city: form.city.trim() || null,
            role,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (upsertError) {
        throw upsertError;
      }

      router.push("/dashboard/ads/new");
    } catch (err: any) {
      setError(err.message ?? "Failed to save your profile.");
      setSaving(false);
    }
  }

  const isBusy = loading || saving;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16">
        <div className="mb-10 md:mb-0 md:flex-1">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            Complete your setup
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Tell us a bit about you
          </h1>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            We use this information to personalize your Jootiya experience and
            help buyers trust your listings.
          </p>
        </div>

        <div className="md:flex-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">
                Profile details
              </h2>
              <p className="text-xs text-zinc-500">
                This only takes a minute. You can always update this later from
                your dashboard.
              </p>
            </div>

            {error ? (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Your full name"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="Phone number"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                  placeholder="City"
                  disabled={isBusy}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isBusy}>
                {saving ? "Saving and continuing..." : "Continue to your ads"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
