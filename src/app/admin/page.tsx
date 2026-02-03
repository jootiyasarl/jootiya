import { getAdminStats, getRecentActivity } from "@/lib/db/admin";
import { AdminStats } from "@/components/admin/AdminStats";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"; // Reusing chart for consistency

export const metadata = {
  title: "Admin Dashboard - Jootiya",
};

export default async function AdminPage() {
  const stats = await getAdminStats();
  const activity = await getRecentActivity();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Dashboard</h2>
        <p className="text-zinc-400">
          Overview of platform performance and moderation queue.
        </p>
      </div>

      <AdminStats stats={stats} />

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <div className="col-span-7 lg:col-span-4">
          {/* Note: DashboardCharts needs to be dark-mode compatible explicitly 
                 Updates to Chart might be needed for absolute consistency, 
                 but it supports dark classes */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-1">
            <DashboardCharts />
          </div>
        </div>
        <div className="col-span-7 lg:col-span-3">
          {/* Placeholder for quick actions or system health */}
          <div className="h-full rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 font-semibold text-zinc-100">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Database Status</span>
                <span className="text-emerald-500 font-medium">Healthy (99.9%)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Storage Usage</span>
                <span className="text-zinc-200">45.2 GB / 1TB</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">API Latency</span>
                <span className="text-emerald-500">12ms</span>
              </div>
              <div className="mt-8 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Pending Moderation</p>
                <p className="text-2xl font-bold text-amber-500">{stats.totalAds - stats.activeAds}</p>
                <p className="text-xs text-zinc-600 mt-1">ads require review</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecentActivity recentJoiners={activity.recentJoiners || []} recentAds={activity.recentAds || []} />
    </div>
  );
}
