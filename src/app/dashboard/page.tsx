import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, ListOrdered, Activity } from "lucide-react";
import {
  createSupabaseServerClient,
  getProfileRole,
  getServerUser,
} from "@/lib/supabase";

type DashboardOverviewAd = {
  id: string;
  status: string | null;
  views_count?: number | null;
};

export default async function DashboardHomePage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const supabase = createSupabaseServerClient();

  const role = await getProfileRole(user.id);

  if (role !== "seller") {
    redirect("/");
  }

  let totalAds = 0;
  let activeAds = 0;
  let totalViews = 0;

  const { data: ads, error: adsError } = await supabase
    .from("ads")
    .select("id, status, views_count")
    .eq("seller_id", user.id)
    .neq("status", "deleted")
    .returns<DashboardOverviewAd[]>();

  if (!adsError && Array.isArray(ads)) {
    totalAds = ads.length;

    for (const ad of ads) {
      const status = (ad.status ?? "").toString().toLowerCase();
      if (status === "active" || status === "published") {
        activeAds += 1;
      }
      totalViews += ad.views_count ?? 0;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 px-4 py-4 text-white shadow-sm sm:px-6 sm:py-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-white">Seller dashboard</h1>
            <p className="text-sm text-orange-50/90">
              Manage your listings and profile in one simple place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/ads/create"
              className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50"
            >
              Create new ad
            </Link>
            <Link
              href="/dashboard/ads"
              className="inline-flex h-9 items-center justify-center rounded-full border border-orange-200 bg-orange-500/10 px-4 text-xs font-medium text-white shadow-sm transition hover:bg-orange-400/90 hover:border-transparent"
            >
              View my ads
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
              Total ads
            </span>
            <ListOrdered className="h-4 w-4 text-orange-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{totalAds}</p>
          <p className="mt-1 text-xs text-zinc-500">
            All your listings except those marked as deleted.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
              Active ads
            </span>
            <Activity className="h-4 w-4 text-orange-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{activeAds}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Currently visible to buyers.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
              Views
            </span>
            <Eye className="h-4 w-4 text-orange-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{totalViews}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Sum of views across all your ads.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5 lg:p-6">
          <h2 className="text-sm font-semibold text-orange-700">Manage my ads</h2>
          <p className="mt-1 text-xs text-zinc-500">
            See all your listings, update details, or pause ads that are no longer needed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard/ads"
              className="inline-flex h-8 items-center justify-center rounded-full bg-orange-500 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-orange-600"
            >
              Go to My ads
            </Link>
            <Link
              href="/dashboard/ads/create"
              className="inline-flex h-8 items-center justify-center rounded-full border border-orange-200 bg-white px-3 text-xs font-medium text-orange-600 shadow-sm transition hover:bg-orange-50"
            >
              Create new ad
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5 lg:p-6">
          <h2 className="text-sm font-semibold text-orange-700">Profile</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Update your contact details so buyers can reach you easily.
          </p>
          <div className="mt-3">
            <Link
              href="/dashboard/profile"
              className="inline-flex h-8 items-center justify-center rounded-full border border-orange-200 bg-white px-3 text-xs font-medium text-orange-600 shadow-sm transition hover:bg-orange-50"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
