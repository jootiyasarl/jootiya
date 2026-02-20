import { getAdminStats, getRecentActivity } from "@/lib/db/admin";
import { getPageViewsStats, getTopPagesStats, getDeviceStats } from "@/lib/db/analytics";
import { AdminStats } from "@/components/admin/AdminStats";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { TopStats } from "@/components/admin/TopStats";
import { Megaphone } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - Jootiya",
};

export default async function AdminPage() {
  const stats = await getAdminStats();
  const activity = await getRecentActivity();
  const analyticsData = await getPageViewsStats();
  const topPages = await getTopPagesStats(5);
  const deviceStats = await getDeviceStats();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 ml-1">Système de Contrôle</p>
          <h2 className="text-4xl font-black tracking-tighter text-white">Tableau de bord</h2>
          <p className="text-zinc-500 text-sm font-medium">
            Surveillance des performances et flux opérationnel en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Serveur Opérationnel</span>
          </div>
        </div>
      </div>

      <AdminStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="col-span-7 lg:col-span-4 space-y-6">
          <div className="rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[5rem] transition-transform group-hover:scale-110" />
            <AnalyticsChart data={analyticsData} />
          </div>
          <TopStats topPages={topPages} deviceStats={deviceStats} />
        </div>
        
        <div className="col-span-7 lg:col-span-3">
          <div className="h-full rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[5rem] transition-transform group-hover:scale-110" />
            <h3 className="mb-8 text-xl font-black text-white flex items-center gap-3 relative z-10">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              État du Système
            </h3>
            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 flex justify-between items-center group/item hover:border-emerald-500/30 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Base de données</span>
                  <p className="text-sm font-bold text-zinc-200">PostgreSQL Clusters</p>
                </div>
                <span className="text-emerald-500 font-black text-xs bg-emerald-500/10 px-2 py-1 rounded-lg">99.9%</span>
              </div>

              <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 flex justify-between items-center group/item hover:border-blue-500/30 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Stockage Cloud</span>
                  <p className="text-sm font-bold text-zinc-200">Supabase Storage</p>
                </div>
                <span className="text-zinc-200 font-black text-xs bg-zinc-800 px-2 py-1 rounded-lg">4.5% utilisé</span>
              </div>

              <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 flex justify-between items-center group/item hover:border-orange-500/30 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Latence Réseau</span>
                  <p className="text-sm font-bold text-zinc-200">Edge Response</p>
                </div>
                <span className="text-emerald-500 font-black text-xs">12ms</span>
              </div>

              <div className="mt-8 p-6 bg-orange-500/5 rounded-[2rem] border border-orange-500/10 relative group/box overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-orange-500/10 transition-transform group-hover/box:scale-110">
                  <Megaphone className="h-24 w-24 -rotate-12" />
                </div>
                <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-3">File de modération</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white">{stats.totalAds - stats.activeAds}</p>
                  <span className="text-xs font-bold text-orange-500/60 uppercase">En attente</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">Action requise pour stabiliser le catalogue public.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecentActivity recentJoiners={activity.recentJoiners || []} recentAds={activity.recentAds || []} />
    </div>
  );
}
