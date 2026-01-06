import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, MessageSquare, ListOrdered, Activity } from "lucide-react";
import { SubscriptionUpgradeCta } from "@/components/subscription/SubscriptionUpgradeCta";
import { createSupabaseServerClient, getProfileRole } from "@/lib/supabase";

type DashboardOverviewAd = {
  id: string;
  status: string | null;
  views_count?: number | null;
};

export default async function DashboardHomePage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const role = await getProfileRole(user.id);

  if (role !== "seller") {
    redirect("/");
  }

  let totalAds = 0;
  let activeAds = 0;
  let totalViews = 0;
  const messagesCount = 0;

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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">Seller dashboard</h1>
        <p className="text-sm text-zinc-500">
          Keep track of your listings, performance, and subscription in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Total ads
            </span>
            <ListOrdered className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{totalAds}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Across all statuses except deleted.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Active ads
            </span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">{activeAds}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Published listings visible to buyers.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
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

        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Messages
            </span>
            <MessageSquare className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-zinc-900">
            {messagesCount}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Conversation analytics will appear once messaging is enabled.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">My ads</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Review all of your active and pending listings.
          </p>
          <div className="mt-3">
            <Link
              href="/dashboard/ads"
              className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800"
            >
              Go to My ads
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">Analytics</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Understand how buyers are engaging with your ads.
          </p>
          <div className="mt-3">
            <Link
              href="/dashboard/analytics"
              className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              View analytics
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Profile & subscription
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Update your contact details and manage your plan.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard/profile"
              className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Edit profile
            </Link>
            <Link
              href="/dashboard/subscription"
              className="inline-flex h-8 items-center justify-center rounded-md bg-amber-900 px-3 text-xs font-medium text-amber-50 shadow-sm transition hover:bg-amber-800"
            >
              View plan
            </Link>
          </div>
        </div>
      </div>

      <SubscriptionUpgradeCta />
    </div>
  );
}
