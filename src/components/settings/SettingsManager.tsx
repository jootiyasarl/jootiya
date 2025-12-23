"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SiteSettingsRow {
  id: string;
  site_name: string | null;
  site_tagline: string | null;
  primary_domain: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  default_seo_image_url: string | null;
  terms_url: string | null;
  privacy_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
}

interface SiteSettingsFormState {
  siteName: string;
  siteTagline: string;
  primaryDomain: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultSeoImageUrl: string;
  termsUrl: string;
  privacyUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

function createEmptyFormState(): SiteSettingsFormState {
  return {
    siteName: "",
    siteTagline: "",
    primaryDomain: "",
    defaultSeoTitle: "",
    defaultSeoDescription: "",
    defaultSeoImageUrl: "",
    termsUrl: "",
    privacyUrl: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
  };
}

export function SettingsManager() {
  const [form, setForm] = useState<SiteSettingsFormState>(createEmptyFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const { data, error: selectError } = await supabase
          .from("site_settings")
          .select(
            "id, site_name, site_tagline, primary_domain, default_seo_title, default_seo_description, default_seo_image_url, terms_url, privacy_url, contact_email, contact_phone, contact_address",
          )
          .eq("id", "site")
          .maybeSingle<SiteSettingsRow>();

        if (selectError) {
          throw selectError;
        }

        if (!cancelled && data) {
          setForm({
            siteName: data.site_name ?? "",
            siteTagline: data.site_tagline ?? "",
            primaryDomain: data.primary_domain ?? "",
            defaultSeoTitle: data.default_seo_title ?? "",
            defaultSeoDescription: data.default_seo_description ?? "",
            defaultSeoImageUrl: data.default_seo_image_url ?? "",
            termsUrl: data.terms_url ?? "",
            privacyUrl: data.privacy_url ?? "",
            contactEmail: data.contact_email ?? "",
            contactPhone: data.contact_phone ?? "",
            contactAddress: data.contact_address ?? "",
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load site settings.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        id: "site",
        site_name: form.siteName.trim() || null,
        site_tagline: form.siteTagline.trim() || null,
        primary_domain: form.primaryDomain.trim() || null,
        default_seo_title: form.defaultSeoTitle.trim() || null,
        default_seo_description: form.defaultSeoDescription.trim() || null,
        default_seo_image_url: form.defaultSeoImageUrl.trim() || null,
        terms_url: form.termsUrl.trim() || null,
        privacy_url: form.privacyUrl.trim() || null,
        contact_email: form.contactEmail.trim() || null,
        contact_phone: form.contactPhone.trim() || null,
        contact_address: form.contactAddress.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (upsertError) {
        throw upsertError;
      }

      setSuccess("Settings saved.");
    } catch (err: any) {
      setError(err.message ?? "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const disabled = loading || saving;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100 md:text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs text-emerald-100 md:text-sm">
          {success}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-50 md:text-base">
              General information
            </h2>
            <p className="text-xs text-zinc-400 md:text-[13px]">
              Basic site identity used across the marketplace.
            </p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="site-name"
                className="text-xs text-zinc-300"
              >
                Site name
              </Label>
              <Input
                id="site-name"
                value={form.siteName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, siteName: event.target.value }))
                }
                placeholder="Jootiya"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="site-tagline"
                className="text-xs text-zinc-300"
              >
                Tagline
              </Label>
              <Input
                id="site-tagline"
                value={form.siteTagline}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    siteTagline: event.target.value,
                  }))
                }
                placeholder="Local marketplace for trusted second-hand deals"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="primary-domain"
                className="text-xs text-zinc-300"
              >
                Primary domain
              </Label>
              <Input
                id="primary-domain"
                value={form.primaryDomain}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    primaryDomain: event.target.value,
                  }))
                }
                placeholder="https://jootiya.com"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-50 md:text-base">
              SEO defaults
            </h2>
            <p className="text-xs text-zinc-400 md:text-[13px]">
              Default metadata used for pages without custom SEO.
            </p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="default-seo-title"
                className="text-xs text-zinc-300"
              >
                Default title
              </Label>
              <Input
                id="default-seo-title"
                value={form.defaultSeoTitle}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    defaultSeoTitle: event.target.value,
                  }))
                }
                placeholder="Buy and sell locally on Jootiya"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="default-seo-description"
                className="text-xs text-zinc-300"
              >
                Default description
              </Label>
              <textarea
                id="default-seo-description"
                value={form.defaultSeoDescription}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    defaultSeoDescription: event.target.value,
                  }))
                }
                placeholder="Short description shown in search results when a page does not override SEO."
                className="min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:opacity-60"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="default-seo-image-url"
                className="text-xs text-zinc-300"
              >
                Default Open Graph image URL
              </Label>
              <Input
                id="default-seo-image-url"
                value={form.defaultSeoImageUrl}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    defaultSeoImageUrl: event.target.value,
                  }))
                }
                placeholder="https://jootiya.com/og-default.jpg"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-50 md:text-base">
              Legal pages
            </h2>
            <p className="text-xs text-zinc-400 md:text-[13px]">
              URLs for your Terms of Service and Privacy Policy.
            </p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="terms-url"
                className="text-xs text-zinc-300"
              >
                Terms of Service URL
              </Label>
              <Input
                id="terms-url"
                value={form.termsUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, termsUrl: event.target.value }))
                }
                placeholder="/legal/terms or full URL"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="privacy-url"
                className="text-xs text-zinc-300"
              >
                Privacy Policy URL
              </Label>
              <Input
                id="privacy-url"
                value={form.privacyUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, privacyUrl: event.target.value }))
                }
                placeholder="/legal/privacy or full URL"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-50 md:text-base">
              Contact information
            </h2>
            <p className="text-xs text-zinc-400 md:text-[13px]">
              How buyers, sellers, and authorities can reach your team.
            </p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="contact-email"
                className="text-xs text-zinc-300"
              >
                Contact email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={form.contactEmail}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    contactEmail: event.target.value,
                  }))
                }
                placeholder="support@jootiya.com"
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="contact-phone"
                className="text-xs text-zinc-300"
              >
                Contact phone
              </Label>
              <Input
                id="contact-phone"
                value={form.contactPhone}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    contactPhone: event.target.value,
                  }))
                }
                placeholder="+212 ..."
                className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="contact-address"
                className="text-xs text-zinc-300"
              >
                Address
              </Label>
              <textarea
                id="contact-address"
                value={form.contactAddress}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    contactAddress: event.target.value,
                  }))
                }
                placeholder="Street, city, country"
                className="min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:opacity-60"
                disabled={disabled}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-9 px-4 text-xs md:text-sm"
            disabled={disabled}
          >
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
