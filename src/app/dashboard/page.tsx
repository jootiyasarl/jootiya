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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900">Seller dashboard</h1>
          <p className="text-sm text-zinc-500">
            Manage your listings and profile in one simple place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/ads/create"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-xs font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800"
          >
            Create new ad
          </Link>
          <Link
            href="/dashboard/ads"
            className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            View my ads
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Total ads
            </span>
            <ListOrdered className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{totalAds}</p>
          <p className="mt-1 text-xs text-zinc-500">
            All your listings except those marked as deleted.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Active ads
            </span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{activeAds}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Currently visible to buyers.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Views
            </span>
            <Eye className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{totalViews}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Sum of views across all your ads.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 sm:p-5 lg:p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Manage my ads</h2>
          <p className="mt-1 text-xs text-zinc-500">
            See all your listings, update details, or pause ads that are no longer needed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard/ads"
              className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800"
            >
              Go to My ads
            </Link>
            <Link
              href="/dashboard/ads/create"
              className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Create new ad
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 sm:p-5 lg:p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Profile</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Update your contact details so buyers can reach you easily.
          </p>
          <div className="mt-3">
            <Link
              href="/dashboard/profile"
              className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
