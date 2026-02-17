import { createSupabaseServerClient, getServerUser, getAuthenticatedServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MyAdsClient } from "./MyAdsClient";
import { SubscriptionUpgradeCta } from "@/components/subscription/SubscriptionUpgradeCta";

export default async function MyAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getServerUser();
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const pageSize = 15;

  if (!user) {
    redirect("/login?redirectTo=/dashboard/ads");
  }

  const supabase = createSupabaseServerClient();

  // Fetch count and data in parallel
  const [countResult, adsResult] = await Promise.all([
    supabase
      .from("ads")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .neq("status", "deleted"),
    supabase
      .from("ads")
      .select(
        "id, title, price, currency, status, image_urls, city, neighborhood, created_at, views_count"
      )
      .eq("seller_id", user.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1),
  ]);

  if (adsResult.error) {
    console.error("Error loading ads:", adsResult.error);
  }

  const totalAds = countResult.count || 0;
  const totalPages = Math.ceil(totalAds / pageSize);

  const mappedAds = (adsResult.data || []).map((ad: any) => ({
    id: ad.id,
    title: ad.title,
    price: ad.price,
    currency: ad.currency,
    status: ad.status,
    location: ad.neighborhood ? `${ad.neighborhood}, ${ad.city}` : ad.city || "Maroc",
    created_at: ad.created_at,
    views_count: ad.views_count,
    images: ad.image_urls || [],
  }));

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">My ads</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your listings, track performance, and boost visibility.
            </p>
          </div>
          <Link href="/dashboard/ads/create">
            <Button className="w-full sm:w-auto">Create new ad</Button>
          </Link>
        </div>

        <SubscriptionUpgradeCta />
      </div>

      <MyAdsClient 
        initialAds={mappedAds} 
        currentPage={currentPage}
        totalPages={totalPages}
        totalAds={totalAds}
      />
    </div>
  );
}
