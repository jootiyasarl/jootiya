"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { uploadAdImages } from "@/lib/adImages";
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
  categorySlug: string;
  price: string;
  city: string;
  neighborhood: string;
  phone: string;
  whatsapp: string;
  images: File[];
}

function createInitialFormState(): CreateAdFormState {
  return {
    title: "",
    categorySlug: "",
    price: "",
    city: "",
    neighborhood: "",
    phone: "",
    whatsapp: "",
    images: [],
  };
}

const CITY_OPTIONS = [
  { value: "Casablanca", label: "الدار البيضاء" },
  { value: "Rabat", label: "الرباط" },
  { value: "Marrakech", label: "مراكش" },
  { value: "Tanger", label: "طنجة" },
  { value: "Fès", label: "فاس" },
  { value: "Agadir", label: "أكادير" },
  { value: "Kenitra", label: "القنيطرة" },
  { value: "Oujda", label: "وجدة" },
  { value: "Tetouan", label: "تطوان" },
  { value: "Mohammedia", label: "المحمدية" },
];
export default function CreateAdPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateAdFormState>(createInitialFormState);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);

      try {
        const { data, error: selectError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name", { ascending: true })
          .returns<CategoryOption[]>();

        if (selectError) {
          throw selectError;
        }

        if (!cancelled) {
          setCategories(data ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "تعذر تحميل الأصناف. حاول مرة أخرى.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleImagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const maxImagesForFreePlan = 3;
    const selected = files.slice(0, maxImagesForFreePlan);

    if (files.length > maxImagesForFreePlan) {
      setError(
        `يمكنك رفع حتى ${maxImagesForFreePlan} صور في الإعلان الواحد في الخطة المجانية.`,
      );
    } else {
      setError(null);
    }

    setForm((prev) => ({ ...prev, images: selected }));

    const previews = selected.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const city = form.city.trim();
    const neighborhood = form.neighborhood.trim();
    const categorySlug = form.categorySlug.trim();
    const phone = form.phone.trim();
    const whatsapp = form.whatsapp.trim();
    const normalizedPrice = form.price.replace(",", ".").trim();
    const priceNumber = Number(normalizedPrice);

    if (!title) {
      setError("الرجاء إدخال عنوان للإعلان.");
      return;
    }

    if (!city) {
      setError("الرجاء إدخال المدينة.");
      return;
    }

    if (!categorySlug) {
      setError("الرجاء اختيار الصنف.");
      return;
    }

    if (!normalizedPrice || !Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("الرجاء إدخال ثمن صالح بالدرهم المغربي.");
      return;
    }

    if (!phone && !whatsapp) {
      setError("الرجاء إدخال رقم الهاتف أو الواتساب.");
      return;
    }

    setPublishing(true);
    setUploadingImages(false);
    setError(null);

    try {
      const response = await fetch("/api/ads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          price: priceNumber,
          city,
          neighborhood: neighborhood || null,
          categorySlug: categorySlug || undefined,
          phone: phone || undefined,
          whatsapp: whatsapp || undefined,
        }),
      });

      if (!response.ok) {
        let message = "تعذر نشر الإعلان. حاول مرة أخرى.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) {
            message = data.error;
          }
        } catch {
          // نتجاهل أخطاء JSON ونستعمل الرسالة الافتراضية
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
              category: categorySlug || null,
            })
            .eq("id", adId);
        } else if (categorySlug) {
          await supabase
            .from("ads")
            .update({ category: categorySlug })
            .eq("id", adId);
        }
      } else if (categorySlug) {
        await supabase
          .from("ads")
          .update({ category: categorySlug })
          .eq("id", adId);
      }

      router.push("/dashboard/ads");
    } catch (err: any) {
      setError(err.message ?? "تعذر نشر الإعلان. حاول مرة أخرى.");
    } finally {
      setPublishing(false);
      setUploadingImages(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">نشر إعلان جديد</h1>
        <p className="text-sm text-zinc-500">
          أضف عنوانًا واضحًا، المدينة، الحي، الصور، ومعلومات التواصل حتى يصل
          إعلانك بسهولة إلى المهتمين.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] max-w-3xl lg:max-w-none"
      >
        <div className="space-y-5 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-1">
            <Label htmlFor="title">عنوان الإعلان</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="مثال: تلفاز سامسونغ 55 بوصة، حالة جيدة"
              disabled={publishing}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">الصنف</Label>
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
                      ? "جاري تحميل الأصناف..."
                      : "اختر الصنف (إلكترونيات، أثاث، ..)"
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

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="price">الثمن بالدرهم المغربي (MAD)</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="مثال: 750"
                disabled={publishing}
              />
            </div>

            <div className="space-y-1">
              <Label>وسيلة التواصل</Label>
              <div className="space-y-2">
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="رقم الهاتف"
                  disabled={publishing}
                />
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, whatsapp: event.target.value }))
                  }
                  placeholder="رقم الواتساب (اختياري)"
                  disabled={publishing}
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                يكفي إدخال رقم الهاتف أو الواتساب، أو كليهما.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="city">المدينة</Label>
              <Select
                value={form.city}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, city: value }))
                }>
                <SelectTrigger id="city" disabled={publishing}>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {CITY_OPTIONS.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="neighborhood">الحي / العنوان</Label>
              <Input
                id="neighborhood"
                value={form.neighborhood}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    neighborhood: event.target.value,
                  }))
                }
                placeholder="مثال: حي المعاريف، قرب محطة الطرام"
                disabled={publishing}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="images">الصور</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              disabled={publishing}
            />
            <p className="text-[11px] text-zinc-500">
              يمكنك رفع حتى 3 صور واضحة للمنتج.
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

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={publishing || uploadingImages}
            >
              {publishing || uploadingImages
                ? "جاري نشر الإعلان..."
                : "نشر الإعلان"}
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block space-y-4 text-xs text-zinc-600">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              نصائح لإعلان ناجح
            </p>
            <ul className="mt-2 space-y-1.5">
              <li>استعمل صورًا واضحة ومضيئة للمنتج من أكثر من زاوية.</li>
              <li>اكتب عنوانًا قصيرًا يصف النوع والحالة (جديد / مستعمل).</li>
              <li>اختر المدينة والحي الصحيحين حتى يظهر إعلانك للقريبين منك.</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
