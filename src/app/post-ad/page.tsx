"use client";

import { useEffect, useState, type FormEvent } from "react";
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

interface CategoryOption {
  id: string;
  name: string;
}

interface CityOption {
  id: string;
  name: string;
}

interface NeighborhoodOption {
  id: string;
  name: string;
}

interface PostAdFormState {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  cityId: string;
  neighborhoodId: string;
}

function createInitialFormState(): PostAdFormState {
  return {
    title: "",
    description: "",
    price: "",
    categoryId: "",
    cityId: "",
    neighborhoodId: "",
  };
}

export default function PostAdPage() {
  const router = useRouter();

  const [form, setForm] = useState<PostAdFormState>(createInitialFormState);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodOption[]>([]);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingInitialData, setLoadingInitialData] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Require authentication using Supabase client
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError) {
        setError("حدث خطأ أثناء التحقق من تسجيل الدخول. حاول مرة أخرى.");
        setCheckingAuth(false);
        return;
      }

      if (!session) {
        router.replace("/login?redirect=/dashboard/ads/create");
        return;
      }

      // User has a client-side session; make sure their profile role is
      // normalized and the session is synced to server cookies so that
      // middleware and server components see them as logged in.
      try {
        const email = session.user?.email ?? "";
        const userId = session.user?.id;

        if (userId) {
          const desiredRole =
            email === "jootiyasarl@gmail.com" ? "admin" : "seller";

          const { data: existingProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("id", userId)
            .maybeSingle();

          if (!profileError) {
            if (!existingProfile) {
              await supabase.from("profiles").insert({
                id: userId,
                email,
                role: desiredRole,
              });
            } else {
              const currentRole = (existingProfile.role ?? "").toString().trim();

              if (currentRole !== desiredRole) {
                await supabase
                  .from("profiles")
                  .update({ role: desiredRole })
                  .eq("id", userId);
              }
            }
          }

          try {
            await fetch("/api/auth/set-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ session }),
            });
          } catch (error) {
            console.error("Failed to sync auth session for /post-ad", error);
          }
        }
      } catch (error) {
        console.error("Failed to ensure user profile for /post-ad", error);
      }

      if (!isMounted) return;

      // Instead of using a separate, legacy form on /post-ad, send
      // authenticated sellers into the main multi-step ad creation flow
      // inside the dashboard so the experience is consistent.
      setCheckingAuth(false);
      router.replace("/dashboard/ads/create");
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Load categories and cities once the user is authenticated
  useEffect(() => {
    if (checkingAuth) return;

    let isMounted = true;

    const loadInitialData = async () => {
      setLoadingInitialData(true);

      const [categoriesResult, citiesResult] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("cities").select("id, name").order("name"),
      ]);

      if (!isMounted) return;

      if (categoriesResult.error || citiesResult.error) {
        setError("تعذر تحميل البيانات. حاول مرة أخرى.");
      } else {
        setCategories((categoriesResult.data as CategoryOption[]) ?? []);
        setCities((citiesResult.data as CityOption[]) ?? []);
      }

      setLoadingInitialData(false);
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [checkingAuth]);

  // Load neighborhoods whenever the city changes
  useEffect(() => {
    if (!form.cityId) {
      setNeighborhoods([]);
      return;
    }

    let isMounted = true;

    const loadNeighborhoods = async () => {
      setLoadingNeighborhoods(true);

      const { data, error: neighborhoodsError } = await supabase
        .from("neighborhoods")
        .select("id, name")
        .eq("city_id", form.cityId)
        .order("name");

      if (!isMounted) return;

      if (neighborhoodsError) {
        setError("تعذر تحميل الأحياء. حاول مرة أخرى.");
        setNeighborhoods([]);
      } else {
        setNeighborhoods((data as NeighborhoodOption[]) ?? []);
      }

      setLoadingNeighborhoods(false);
    };

    void loadNeighborhoods();

    return () => {
      isMounted = false;
    };
  }, [form.cityId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || checkingAuth || loadingInitialData) return;

    if (!form.title.trim()) {
      setError("العنوان مطلوب.");
      return;
    }

    if (!form.description.trim()) {
      setError("الوصف مطلوب.");
      return;
    }

    if (!form.categoryId) {
      setError("يجب اختيار القسم.");
      return;
    }

    if (!form.cityId) {
      setError("يجب اختيار المدينة.");
      return;
    }

    const normalizedPrice = form.price.replace(",", ".").trim();
    const priceNumber = Number(normalizedPrice);

    if (!normalizedPrice || !Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("أدخل سعرًا صالحًا أكبر من صفر.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setSubmitting(false);
      router.replace("/login?redirect=/dashboard/ads/create");
      return;
    }

    const { error: insertError } = await supabase.from("ads").insert({
      title: form.title.trim(),
      description: form.description.trim(),
      price: priceNumber,
      category_id: form.categoryId,
      city_id: form.cityId,
      neighborhood_id: form.neighborhoodId || null,
      status: "pending",
      user_id: session.user.id,
    });

    if (insertError) {
      setError("تعذر حفظ الإعلان. حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    setSuccess("تم إرسال إعلانك بنجاح! سيتم مراجعته قبل النشر.");
    setForm(createInitialFormState());
    setSubmitting(false);
  }

  const disabled =
    submitting || checkingAuth || loadingInitialData || loadingNeighborhoods;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16">
        <div className="mb-10 md:mb-0 md:flex-1">
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            أنشئ إعلانًا محليًا
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            نشر إعلان على جوتيا
          </h1>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            اكتب تفاصيل واضحة عن ما تعرضه للبيع، وحدد المدينة والحي المناسبين
            حتى يصل إعلانك بسرعة إلى المهتمين.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>كل الإعلانات تمر بمراجعة سريعة للجودة والأمان.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>يمكنك تعديل أو إيقاف إعلانك لاحقًا من لوحة التحكم.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>نحافظ على خصوصية بياناتك ولا نعرضها بشكل علني.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p>مصمم للأفراد والتجار الصغار في السوق المحلي.</p>
            </div>
          </div>
        </div>

        <div className="md:flex-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-zinc-900">تفاصيل الإعلان</h2>
              <p className="text-xs text-zinc-500">
                املأ الحقول التالية بدقة لمساعدة المشترين على فهم إعلانك بسرعة.
              </p>
            </div>

            {checkingAuth || loadingInitialData ? (
              <div className="text-xs text-zinc-500">جاري تحميل البيانات...</div>
            ) : null}

            {error ? (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {success}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">عنوان الإعلان</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="مثال: آيفون 13 برو، 256GB، حالة ممتازة"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">وصف الإعلان</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="أضف تفاصيل واضحة عن المنتج أو الخدمة، حالته، وأي معلومات مهمة للمشتري."
                  className="min-h-[120px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="price">السعر</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    placeholder="مثال: 7500"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category">القسم</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, categoryId: value }))
                    }
                  >
                    <SelectTrigger
                      id="category"
                      disabled={disabled || categories.length === 0}
                    >
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={form.cityId}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        cityId: value,
                        neighborhoodId: "",
                      }))
                    }
                  >
                    <SelectTrigger
                      id="city"
                      disabled={disabled || cities.length === 0}
                    >
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="neighborhood">الحي (اختياري)</Label>
                  <Select
                    value={form.neighborhoodId}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, neighborhoodId: value }))
                    }
                  >
                    <SelectTrigger
                      id="neighborhood"
                      disabled={
                        disabled ||
                        !form.cityId ||
                        loadingNeighborhoods ||
                        neighborhoods.length === 0
                      }
                    >
                      <SelectValue
                        placeholder={
                          loadingNeighborhoods
                            ? "جاري تحميل الأحياء..."
                            : "اختر الحي (إن وجد)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {neighborhoods.map((neighborhood) => (
                        <SelectItem key={neighborhood.id} value={neighborhood.id}>
                          {neighborhood.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={disabled}>
                {submitting ? "جاري إرسال الإعلان..." : "نشر الإعلان"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
