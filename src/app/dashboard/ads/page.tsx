import { createSupabaseServerClient, getServerUser } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MyAdsClient } from "./MyAdsClient";
import { SubscriptionUpgradeCta } from "@/components/subscription/SubscriptionUpgradeCta";

export default async function MyAdsPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/ads");
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("ads")
    .select(
      "id, title, price, currency, status, image_urls, location, created_at, views_count"
    )
    .eq("seller_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading ads:", error);
    // You could show an error state or just empty ads
  }

  const mappedAds = (data || []).map((ad: any) => ({
    id: ad.id,
    title: ad.title,
    price: ad.price,
    currency: ad.currency,
    status: ad.status,
    location: ad.location,
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

      <MyAdsClient initialAds={mappedAds} />
    </div>
  );
}
