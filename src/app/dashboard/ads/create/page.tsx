"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  getBrowserGeolocation,
  DEFAULT_SEARCH_RADIUS_KM,
} from "@/lib/adLocation";
import { uploadAdImages } from "@/lib/adImages";
import { cn } from "@/lib/utils";
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

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface CreateAdFormState {
  title: string;
  description: string;
  categorySlug: string;
  price: string;
  currency: string;
  isWholesale: boolean;
  wholesalePrice: string;
  minimumQuantity: string;
  city: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  searchRadiusKm: string;
  phone: string;
  whatsapp: string;
  condition: "new" | "used" | "";
  images: File[];
}

function createInitialFormState(): CreateAdFormState {
  return {
    title: "",
    description: "",
    categorySlug: "",
    price: "",
    currency: "MAD",
    isWholesale: false,
    wholesalePrice: "",
    minimumQuantity: "",
    city: "",
    neighborhood: "",
    latitude: null,
    longitude: null,
    searchRadiusKm: String(DEFAULT_SEARCH_RADIUS_KM),
    phone: "",
    whatsapp: "",
    condition: "",
    images: [],
  };
}

const STEPS = [
  { id: 1, label: "Basic info" },
  { id: 2, label: "Pricing & type" },
  { id: 3, label: "Location" },
  { id: 4, label: "Images" },
  { id: 5, label: "Review & publish" },
] as const;

export default function CreateAdPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<CreateAdFormState>(createInitialFormState);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);

      try {
        const { data, error: selectError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("popularity", { ascending: false })
          .returns<CategoryOption[]>();

        if (selectError) {
          throw selectError;
        }

        if (!cancelled) {
          setCategories(data ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load categories.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function validateBasicInfo(): string | null {
    if (!form.title.trim()) {
      return "Title is required.";
    }

    if (!form.description.trim()) {
      return "Description is required.";
    }

    if (!form.categorySlug) {
      return "Category is required.";
    }

    return null;
  }

  function validatePricing(): string | null {
    const normalizedPrice = form.price.replace(",", ".").trim();
    const priceNumber = Number(normalizedPrice);

    if (!normalizedPrice || !Number.isFinite(priceNumber) || priceNumber <= 0) {
      return "Enter a valid price greater than zero.";
    }

    if (!form.currency.trim()) {
      return "Currency is required.";
    }

    if (form.isWholesale) {
      const wholesalePrice = form.wholesalePrice.replace(",", ".").trim();
      const wholesalePriceNumber = Number(wholesalePrice);

      if (
        !wholesalePrice ||
        !Number.isFinite(wholesalePriceNumber) ||
        wholesalePriceNumber <= 0
      ) {
        return "Enter a valid wholesale price greater than zero.";
      }

      const minQty = form.minimumQuantity.trim();
      const minQtyNumber = Number(minQty);

      if (!minQty || !Number.isInteger(minQtyNumber) || minQtyNumber <= 0) {
        return "Enter a valid minimum quantity for wholesale.";
      }
    }

    return null;
  }

  function validateLocation(): string | null {
    if (!form.city.trim()) {
      return "City is required.";
    }

    const trimmedRadius = form.searchRadiusKm.trim();
    if (trimmedRadius) {
      const radius = Number(trimmedRadius);
      if (!Number.isFinite(radius) || radius <= 0) {
        return "Search radius must be a positive number of kilometers.";
      }
    }

    return null;
  }

  function handleNextStep() {
    let validationError: string | null = null;

    if (step === 1) {
      validationError = validateBasicInfo();
    } else if (step === 2) {
      validationError = validatePricing();
    } else if (step === 3) {
      validationError = validateLocation();
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setStep((prev) => Math.min(prev + 1, STEPS.length));
  }

  function handlePrevStep() {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleDetectLocation() {
    setLocationStatus("Detecting your location...");
    setError(null);

    try {
      const { latitude, longitude } = await getBrowserGeolocation();
      setForm((prev) => ({ ...prev, latitude, longitude }));
      setLocationStatus(
        "Location detected. We'll use this to calculate distance to buyers.",
      );
    } catch (err: any) {
      setLocationStatus(null);
      setError(
        err.message ??
          "We couldn't detect your location. Please enter it manually.",
      );
    }
  }

  function handleImagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const maxImagesForFreePlan = 3;
    const selected = files.slice(0, maxImagesForFreePlan);

    if (files.length > maxImagesForFreePlan) {
      setError(
        `Free plan lets you upload up to ${maxImagesForFreePlan} images per ad.`,
      );
    } else {
      setError(null);
    }

    setForm((prev) => ({ ...prev, images: selected }));

    const previews = selected.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step !== 5) {
      return;
    }

    const basicError = validateBasicInfo();
    if (basicError) {
      setError(basicError);
      setStep(1);
      return;
    }

    const pricingError = validatePricing();
    if (pricingError) {
      setError(pricingError);
      setStep(2);
      return;
    }

    const locationError = validateLocation();
    if (locationError) {
      setError(locationError);
      setStep(3);
      return;
    }

    if (!captchaChecked) {
      setError("Please confirm that you are not a robot.");
      return;
    }

    setPublishing(true);
    setUploadingImages(false);
    setError(null);

    try {
      const normalizedPrice = form.price.replace(",", ".").trim();
      const priceNumber = Number(normalizedPrice);

      const trimmedRadius = form.searchRadiusKm.trim();
      const radiusNumber = trimmedRadius ? Number(trimmedRadius) : undefined;
      const finalRadius =
        radiusNumber && Number.isFinite(radiusNumber) && radiusNumber > 0
          ? radiusNumber
          : DEFAULT_SEARCH_RADIUS_KM;

      const wholesalePriceNumber = form.isWholesale
        ? Number(form.wholesalePrice.replace(",", ".").trim() || "0") || null
        : null;
      const minQuantityNumber = form.isWholesale
        ? Number(form.minimumQuantity.trim() || "0") || null
        : null;

      const response = await fetch("/dashboard/ads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: priceNumber,
          currency: form.currency.trim() || "MAD",
          city: form.city.trim(),
          neighborhood: form.neighborhood.trim() || null,
          latitude: form.latitude,
          longitude: form.longitude,
          searchRadiusKm: finalRadius,
          isWholesale: form.isWholesale,
          categorySlug: form.categorySlug || undefined,
          phone: form.phone.trim() || undefined,
          whatsapp: form.whatsapp.trim() || undefined,
          wholesalePrice: wholesalePriceNumber,
          minQuantity: minQuantityNumber,
        }),
      });

      if (!response.ok) {
        let message = "Failed to publish ad. Please try again.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) {
            message = data.error;
          }
        } catch {
          // ignore JSON parse errors and fall back to default message
        }

        throw new Error(message);
      }

      const result = (await response.json()) as { adId: string; status: string };

      const adId = result.adId;

      if (form.images.length > 0) {
        setUploadingImages(true);
        const uploaded = await uploadAdImages(adId, form.images);
        const publicUrls = uploaded
          .map((item) => item.publicUrl)
          .filter((url): url is string => Boolean(url));

        if (publicUrls.length) {
          await supabase
            .from("ads")
            .update({
              image_urls: publicUrls,
              category: form.categorySlug || null,
            })
            .eq("id", adId);
        } else if (form.categorySlug) {
          await supabase
            .from("ads")
            .update({ category: form.categorySlug })
            .eq("id", adId);
        }
      } else if (form.categorySlug) {
        await supabase
          .from("ads")
          .update({ category: form.categorySlug })
          .eq("id", adId);
      }

      router.push("/dashboard/ads");
    } catch (err: any) {
      setError(err.message ?? "Failed to publish ad. Please try again.");
    } finally {
      setPublishing(false);
      setUploadingImages(false);
    }
  }

  const currentStep = STEPS.find((item) => item.id === step);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">Create a new ad</h1>
        <p className="text-sm text-zinc-500">
          Share what you are selling with buyers nearby. Clear details, accurate
          location, and good photos help your ad perform better.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <form
          onSubmit={handlePublish}
          className="space-y-6 rounded-2xl border bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Step {step} of {STEPS.length}
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {currentStep?.label}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {STEPS.map((item) => {
                  const isActive = item.id === step;
                  const isCompleted = item.id < step;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-1.5"
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border text-[11px]",
                          isActive &&
                            "border-zinc-900 bg-zinc-900 text-zinc-50",
                          !isActive &&
                            !isCompleted &&
                            "border-zinc-200 bg-white text-zinc-500",
                          isCompleted &&
                            "border-emerald-500 bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {item.id}
                      </div>
                      <span
                        className={cn(
                          "hidden text-xs font-medium text-zinc-500 sm:inline",
                          isActive && "text-zinc-900",
                          isCompleted && "text-emerald-700",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}

            {locationStatus ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {locationStatus}
              </div>
            ) : null}
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="e.g. iPhone 13 Pro, 256GB, excellent condition"
                  disabled={publishing}
                />
                <p className="text-[11px] text-zinc-500">
                  Use clear, searchable keywords buyers might type into the
                  search bar.
                </p>
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
                  placeholder="Describe the item, its condition, what is included, and any important details. Basic Markdown is supported on the public ad."
                  className="min-h-[140px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={publishing}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.categorySlug}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, categorySlug: value }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue
                      placeholder={
                        loadingCategories
                          ? "Loading categories..."
                          : "Select a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
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
                    disabled={publishing}
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

              <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
                <div className="flex items-start gap-2">
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
                    disabled={publishing}
                    className="mt-0.5 h-3.5 w-3.5 rounded border border-zinc-300 text-zinc-900"
                  />
                  <label htmlFor="is-wholesale" className="select-none">
                    This is a wholesale or bulk offer.
                  </label>
                </div>

                {form.isWholesale ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="wholesale-price">Wholesale price</Label>
                      <Input
                        id="wholesale-price"
                        type="text"
                        inputMode="decimal"
                        value={form.wholesalePrice}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            wholesalePrice: event.target.value,
                          }))
                        }
                        placeholder="Price per unit for bulk orders"
                        disabled={publishing}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="minimum-quantity">
                        Minimum quantity
                      </Label>
                      <Input
                        id="minimum-quantity"
                        type="number"
                        inputMode="numeric"
                        value={form.minimumQuantity}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            minimumQuantity: event.target.value,
                          }))
                        }
                        placeholder="e.g. 10"
                        disabled={publishing}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    placeholder="Phone number buyers can reach you on"
                    disabled={publishing}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={form.whatsapp}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        whatsapp: event.target.value,
                      }))
                    }
                    placeholder="WhatsApp number (optional)"
                    disabled={publishing}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Condition</Label>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, condition: "new" }))
                    }
                    className={cn(
                      "inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium",
                      form.condition === "new"
                        ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, condition: "used" }))
                    }
                    className={cn(
                      "inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium",
                      form.condition === "used"
                        ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    Used
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
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
                    disabled={publishing}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="neighborhood">Neighborhood (حي)</Label>
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
                    disabled={publishing}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="space-y-1">
                  <Label htmlFor="radius">Search radius (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    inputMode="decimal"
                    value={form.searchRadiusKm}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        searchRadiusKm: event.target.value,
                      }))
                    }
                    placeholder={String(DEFAULT_SEARCH_RADIUS_KM)}
                    disabled={publishing}
                  />
                  <p className="text-[11px] text-zinc-500">
                    We use this radius to show buyers how close the ad is to
                    them.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="sr-only">Auto-detect location</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5 h-9 w-full text-xs"
                    onClick={handleDetectLocation}
                    disabled={publishing}
                  >
                    Use my current location (optional)
                  </Button>
                  <p className="text-[11px] text-zinc-500">
                    We only store approximate coordinates to calculate
                    distance. You can still choose city and neighborhood
                    manually.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  disabled={publishing}
                />
                <p className="text-[11px] text-zinc-500">
                  Free plan: up to 3 images per ad. Choose clear, well-lit
                  photos that show the item from different angles.
                </p>
              </div>

              {imagePreviews.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {imagePreviews.map((src, index) => (
                    <div
                      key={src}
                      className="relative aspect-square overflow-hidden rounded-lg border bg-zinc-100"
                    >
                      <Image
                        src={src}
                        alt={`Preview ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Review
                </p>
                <p>
                  Make sure the details below match what you want buyers to
                  see. You can go back to edit any step before publishing.
                </p>
              </div>

              <div className="space-y-3 text-sm text-zinc-700">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Title</p>
                  <p className="text-sm font-semibold text-zinc-900">
                    {form.title || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    Description
                  </p>
                  <p className="whitespace-pre-line text-sm text-zinc-700">
                    {form.description || "—"}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">
                      Pricing
                    </p>
                    <p className="text-sm text-zinc-900">
                      {form.price ? `${form.price} ${form.currency}` : "—"}
                    </p>
                    {form.isWholesale ? (
                      <p className="text-xs text-zinc-500">
                        Wholesale: {form.wholesalePrice || "—"} per unit,
                        min. {form.minimumQuantity || "—"} units.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-zinc-500">
                      Location
                    </p>
                    <p className="text-sm text-zinc-900">
                      {form.neighborhood ? `${form.neighborhood}, ` : null}
                      {form.city || "—"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">
                      Contact
                    </p>
                    <p className="text-sm text-zinc-900">
                      {form.phone || "No phone added"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      WhatsApp: {form.whatsapp || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-zinc-500">
                      Condition
                    </p>
                    <p className="text-sm text-zinc-900">
                      {form.condition === "new"
                        ? "New"
                        : form.condition === "used"
                          ? "Used"
                          : "Not specified"}
                    </p>
                  </div>
                </div>

                {imagePreviews.length ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-500">
                      Images
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {imagePreviews.map((src, index) => (
                        <div
                          key={src}
                          className="relative aspect-square overflow-hidden rounded-lg border bg-zinc-100"
                        >
                          <Image
                            src={src}
                            alt={`Preview ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 33vw, 25vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Security check
                  </p>
                  <div className="flex items-start gap-2">
                    <input
                      id="captcha-check"
                      type="checkbox"
                      checked={captchaChecked}
                      onChange={(event) =>
                        setCaptchaChecked(event.target.checked)
                      }
                      className="mt-0.5 h-3.5 w-3.5 rounded border border-zinc-300 text-zinc-900"
                    />
                    <label htmlFor="captcha-check" className="select-none">
                      I am not a robot. This simple check helps keep Jootiya
                      safe from spam.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span>
                Step {step} of {STEPS.length}
              </span>
              {(publishing || uploadingImages) && (
                <span className="text-zinc-700">
                  {uploadingImages
                    ? "Uploading images..."
                    : "Publishing ad..."}
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  disabled={publishing}
                >
                  Back
                </Button>
              ) : null}

              {step < STEPS.length ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNextStep}
                  disabled={publishing}
                >
                  Next step
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={publishing}
                >
                  {publishing ? "Publishing..." : "Publish ad"}
                </Button>
              )}
            </div>
          </div>
        </form>

        <aside className="space-y-4 text-xs text-zinc-600">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Tips for better ads
            </p>
            <ul className="mt-2 space-y-1.5">
              <li>
                Use a clear, descriptive title with the model, size, and
                condition.
              </li>
              <li>
                Add honest details in the description so buyers trust you.
              </li>
              <li>
                Choose the closest city and neighborhood so we can show
                distance to nearby buyers.
              </li>
              <li>
                Upload bright, sharp photos that show the item from multiple
                angles.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
