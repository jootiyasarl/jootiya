import { getAdminStats, getRecentActivity } from "@/lib/db/admin";
import { getPageViewsStats, getTopPagesStats, getDeviceStats } from "@/lib/db/analytics";
import { AdminStats } from "@/components/admin/AdminStats";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { TopStats } from "@/components/admin/TopStats";
import { Megaphone, Activity, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
  title: "Tableau de bord | Jootiya Admin",
};

export default async function AdminPage() {
  const stats = await getAdminStats();
  const activity = await getRecentActivity();
  const analyticsData = await getPageViewsStats();
  const topPages = await getTopPagesStats(5);
  const deviceStats = await getDeviceStats();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/10 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Système de Contrôle</p>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white">Tableau de bord</h2>
          <p className="text-zinc-500 text-sm font-medium">
            Surveillance des performances et flux opérationnel en temps réel.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Serveur Opérationnel</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <AdminStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Analytics Section */}
        <div className="col-span-7 lg:col-span-4 space-y-6">
          <div className="rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[5rem] transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-3 mb-8">
              <Activity className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-black text-white">Flux de Visites</h3>
            </div>
            <AnalyticsChart data={analyticsData} />
          </div>
          <TopStats topPages={topPages} deviceStats={deviceStats} />
        </div>
        
        {/* System Health Section */}
        <div className="col-span-7 lg:col-span-3">
          <div className="h-full rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[5rem] transition-transform group-hover:scale-110" />
            <h3 className="mb-8 text-xl font-black text-white flex items-center gap-3 relative z-10">
              <Zap className="w-5 h-5 text-emerald-500" />
              État du Système
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="p-5 bg-zinc-950/50 rounded-3xl border border-zinc-800/50 flex justify-between items-center group/item hover:border-emerald-500/30 transition-all duration-500">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Base de données</span>
                  <p className="text-sm font-bold text-zinc-200">PostgreSQL Clusters</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-500 font-black text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">99.9%</span>
                </div>
              </div>

              <div className="p-5 bg-zinc-950/50 rounded-3xl border border-zinc-800/50 flex justify-between items-center group/item hover:border-blue-500/30 transition-all duration-500">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Stockage Cloud</span>
                  <p className="text-sm font-bold text-zinc-200">Supabase Storage</p>
                </div>
                <span className="text-zinc-200 font-black text-xs bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-700/50">4.5% utilisé</span>
              </div>

              {/* Moderation Queue Alert */}
              <div className="mt-8 p-8 bg-orange-500/10 rounded-[2.5rem] border border-orange-500/20 relative group/box overflow-hidden shadow-lg shadow-orange-500/5">
                <div className="absolute -right-4 -bottom-4 text-orange-500/10 transition-transform duration-700 group-hover/box:scale-125 group-hover/box:-rotate-12">
                  <Megaphone className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-4">File de modération</p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl font-black text-white tabular-nums tracking-tighter">
                      {stats.totalAds - stats.activeAds}
                    </p>
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">En attente</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed font-medium">
                    Des actions sont requises pour stabiliser le catalogue public.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <RecentActivity recentJoiners={activity.recentJoiners || []} recentAds={activity.recentAds || []} />
    </div>
  );
}
