"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";

interface AdminStatsProps {
    stats: {
        totalUsers: number;
        totalAds: number;
        activeAds: number;
        totalRevenue: number;
        growth: { users: number; ads: number };
    };
}

export function AdminStats({ stats }: AdminStatsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-100 rounded-[2rem] shadow-2xl transition-all hover:border-emerald-500/30 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Revenu Total (GMV)</CardTitle>
                    <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight">${stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-emerald-500 font-bold flex items-center mt-2 bg-emerald-500/5 py-1 px-2 rounded-lg w-fit">
                        <TrendingUp className="h-3 w-3 mr-1.5" />
                        +15.2%
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-100 rounded-[2rem] shadow-2xl transition-all hover:border-orange-500/30 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Utilisateurs</CardTitle>
                    <div className="p-2 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <Users className="h-4 w-4 text-orange-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight">{stats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-orange-500 font-bold flex items-center mt-2 bg-orange-500/5 py-1 px-2 rounded-lg w-fit">
                        +{stats.growth.users}% nouveaux
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-100 rounded-[2rem] shadow-2xl transition-all hover:border-purple-500/30 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Annonces Totales</CardTitle>
                    <div className="p-2 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <ShoppingBag className="h-4 w-4 text-purple-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight">{stats.totalAds.toLocaleString()}</div>
                    <p className="text-xs text-purple-500 font-bold flex items-center mt-2 bg-purple-500/5 py-1 px-2 rounded-lg w-fit">
                        +{stats.growth.ads}% croissance
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-100 rounded-[2rem] shadow-2xl transition-all hover:border-orange-500/30 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">En Ligne</CardTitle>
                    <div className="p-2 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <ShoppingBag className="h-4 w-4 text-orange-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight">{stats.activeAds.toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actif maintenant</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
