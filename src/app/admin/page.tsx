import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin moderation | Jootiya",
};

interface PendingAd {
  id: string;
  title: string;
  price: number | null;
  created_at: string | null;
  category_id: string | null;
  city_id: string | null;
  category_name: string | null;
  city_name: string | null;
}

async function requireAdmin() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  if (user.email !== "jootiyasarl@gmail.com") {
    redirect("/");
  }

  return user;
}

async function getPendingAds(): Promise<PendingAd[]> {
  await requireAdmin();

  const supabase = createSupabaseServerClient();

  const { data: ads, error } = await supabase
    .from("ads")
    .select("id, title, price, created_at, category_id, city_id, status")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !ads) {
    console.error("Failed to load pending ads", error);
    return [];
  }

  const categoryIds = Array.from(
    new Set(
      ads
        .map((ad: any) => ad.category_id)
        .filter((id: unknown): id is string | number => id !== null && id !== undefined),
    ),
  );

  const cityIds = Array.from(
    new Set(
      ads
        .map((ad: any) => ad.city_id)
        .filter((id: unknown): id is string | number => id !== null && id !== undefined),
    ),
  );

  const [categoriesResult, citiesResult] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [] as any[], error: null }),
    cityIds.length
      ? supabase.from("cities").select("id, name").in("id", cityIds)
      : Promise.resolve({ data: [] as any[], error: null }),
  ]);

  const categoryMap = new Map<string, string>();
  if (!categoriesResult.error && categoriesResult.data) {
    for (const row of categoriesResult.data as { id: string | number; name: string }[]) {
      categoryMap.set(String(row.id), row.name);
    }
  }

  const cityMap = new Map<string, string>();
  if (!citiesResult.error && citiesResult.data) {
    for (const row of citiesResult.data as { id: string | number; name: string }[]) {
      cityMap.set(String(row.id), row.name);
    }
  }

  return (ads as any[]).map((ad) => ({
    id: String(ad.id),
    title: ad.title ?? "",
    price: ad.price ?? null,
    created_at: ad.created_at ?? null,
    category_id: ad.category_id ?? null,
    city_id: ad.city_id ?? null,
    category_name:
      ad.category_id != null ? categoryMap.get(String(ad.category_id)) ?? null : null,
    city_name: ad.city_id != null ? cityMap.get(String(ad.city_id)) ?? null : null,
  }));
}

async function updateAdStatus(adId: string, status: "approved" | "rejected"): Promise<void> {
  if (!adId) {
    throw new Error("Missing ad id");
  }

  await requireAdmin();

  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("ads")
    .update({ status })
    .eq("id", adId)
    .eq("status", "pending");

  if (error) {
    console.error("Failed to update ad status", error);
    throw new Error("Failed to update ad.");
  }

  revalidatePath("/admin");
}

async function approveAd(formData: FormData): Promise<void> {
  "use server";

  const adId = formData.get("adId");
  const id = typeof adId === "string" ? adId : "";

  await updateAdStatus(id, "approved");
}

async function rejectAd(formData: FormData): Promise<void> {
  "use server";

  const adId = formData.get("adId");
  const id = typeof adId === "string" ? adId : "";

  await updateAdStatus(id, "rejected");
}

export default async function AdminModerationPage() {
  await requireAdmin();
  const pendingAds = await getPendingAds();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Pending ads moderation
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          Review new listings, approve high-quality ads, and reject spam or low-quality
          content.
        </p>
      </div>

      {pendingAds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center text-xs text-zinc-400 md:text-sm">
          لا توجد إعلانات قيد المراجعة حاليًا.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
          <table className="min-w-full divide-y divide-zinc-800 text-xs md:text-sm">
            <thead>
              <tr className="bg-zinc-950/80 text-zinc-400">
                <th className="px-4 py-3 text-right font-medium">العنوان</th>
                <th className="px-4 py-3 text-right font-medium">السعر</th>
                <th className="px-4 py-3 text-right font-medium">القسم</th>
                <th className="px-4 py-3 text-right font-medium">المدينة</th>
                <th className="px-4 py-3 text-right font-medium">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pendingAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-zinc-900/40">
                  <td className="px-4 py-3 align-top text-zinc-50">
                    <div className="max-w-xs truncate md:max-w-sm">{ad.title}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-100">
                    {ad.price != null ? `${ad.price.toLocaleString("fr-MA")} MAD` : "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-200">
                    {ad.category_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-200">
                    {ad.city_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-400">
                    {ad.created_at
                      ? new Date(ad.created_at).toLocaleString("fr-MA", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <form action={approveAd}>
                        <input type="hidden" name="adId" value={ad.id} />
                        <Button
                          type="submit"
                          className="h-7 rounded-full bg-emerald-500 px-3 text-xs font-medium text-emerald-950 transition hover:bg-emerald-400"
                        >
                          Approve
                        </Button>
                      </form>
                      <form action={rejectAd}>
                        <input type="hidden" name="adId" value={ad.id} />
                        <Button
                          type="submit"
                          className="h-7 rounded-full border border-red-500/60 bg-transparent px-3 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                        >
                          Reject
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
