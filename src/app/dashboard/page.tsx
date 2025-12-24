import Link from "next/link";
import { SubscriptionUpgradeCta } from "@/components/subscription/SubscriptionUpgradeCta";

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">Seller dashboard</h1>
        <p className="text-sm text-zinc-500">
          Keep track of your listings, performance, and subscription in one place.
        </p>
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
          <h2 className="text-sm font-semibold text-zinc-900">Profile & subscription</h2>
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
