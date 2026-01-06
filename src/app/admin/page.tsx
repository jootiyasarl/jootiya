import Link from "next/link";
import { Users, Megaphone, Tag, Settings as SettingsIcon } from "lucide-react";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Admin dashboard
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          High-level control center for users, ads, categories, and global settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">Users</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Review accounts, manage roles, and verify or ban users.
              </p>
            </div>
            <Users className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-3">
            <Link
              href="/admin/users"
              className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-50 px-3 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-200"
            >
              Open users
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">Ads</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Moderate listings, approve or reject ads, and feature key offers.
              </p>
            </div>
            <Megaphone className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-3">
            <Link
              href="/admin/ads"
              className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-50 px-3 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-200"
            >
              Open ads
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">Categories</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Configure marketplace categories for navigation and SEO.
              </p>
            </div>
            <Tag className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-3">
            <Link
              href="/admin/categories"
              className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-50 px-3 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-200"
            >
              Open categories
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">Settings</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Manage global configuration, branding, and legal information.
              </p>
            </div>
            <SettingsIcon className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-3">
            <Link
              href="/admin/settings"
              className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-50 px-3 text-xs font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-200"
            >
              Open settings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
