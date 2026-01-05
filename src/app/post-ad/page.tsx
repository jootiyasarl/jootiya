"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { publishFreeAd } from "@/lib/ads";
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

interface PostAdFormState {
  title: string;
  description: string;
  price: string;
  currency: string;
  city: string;
  neighborhood: string;
  isWholesale: boolean;
}

function createInitialFormState(): PostAdFormState {
  return {
    title: "",
    description: "",
    price: "",
    currency: "MAD",
    city: "",
    neighborhood: "",
    isWholesale: false,
  };
}

export default function PostAdPage() {
  const router = useRouter();
  const [form, setForm] = useState<PostAdFormState>(createInitialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    const normalizedPrice = form.price.replace(",", ".").trim();
    const priceNumber = Number(normalizedPrice);

    if (!normalizedPrice || !Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await publishFreeAd({
        title: form.title.trim(),
        description: form.description.trim(),
        price: priceNumber,
        currency: form.currency.trim() || "MAD",
        city: form.city.trim(),
        neighborhood: form.neighborhood.trim() || undefined,
        imageUrls: [],
        isWholesale: form.isWholesale,
      });

      const status = encodeURIComponent(result.status);
      router.push(`/post-ad/success?status=${status}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to publish ad. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = submitting;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16">
        <div className="mb-10 md:mb-0 md:flex-1">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            Create a local listing
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Post an ad on Jootiya
          </h1>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            Share what you are selling with people nearby. Clear details and fair
            pricing help your ad get approved quickly and reach the right buyers.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>All ads go through a quick safety and quality review.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>You can edit, pause, or promote your ad from your dashboard.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>We never show your contact details publicly without consent.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>Designed for individual sellers and small businesses.</p>
            </div>
          </div>
        </div>

        <div className="md:flex-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">Ad details</h2>
              <p className="text-xs text-zinc-500">
                Describe what you are offering so buyers can quickly understand
                if it is right for them.
              </p>
            </div>

            {error ? (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="e.g. iPhone 13 Pro, 256GB, excellent condition"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Add clear details about the item, its condition, and anything buyers should know."
                  className="min-h-[120px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    placeholder="e.g. 7500"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    placeholder="e.g. Casablanca"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="neighborhood">Neighborhood (optional)</Label>
                  <Input
                    id="neighborhood"
                    value={form.neighborhood}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        neighborhood: event.target.value,
                      }))
                    }
                    placeholder="e.g. Maarif"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-zinc-600">
                <input
                  id="is-wholesale"
                  type="checkbox"
                  checked={form.isWholesale}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isWholesale: event.target.checked,
                    }))
                  }
                  disabled={disabled}
                  className="mt-0.5 h-3.5 w-3.5 rounded border border-zinc-300 text-zinc-900"
                />
                <label htmlFor="is-wholesale" className="select-none">
                  This is a wholesale or bulk offer.
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={disabled}>
                {submitting ? "Publishing ad..." : "Publish ad"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
