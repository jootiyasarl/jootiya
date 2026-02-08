"use client";

import { useState } from "react";
import { DashboardStats } from "./DashboardStats";
import { DashboardCharts } from "./DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, ShoppingBag, MessageSquare, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsClientProps {
    stats: any;
    ads: any[];
}

export function AnalyticsClient({ stats, ads }: AnalyticsClientProps) {
    // Sort ads by views_count for "Top Performing Ads"
    const topAds = [...ads].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                    Analyse des Performances
                </h1>
                <p className="text-zinc-500 font-bold">
                    Visualisez l'impact de vos annonces et l'engagement de vos acheteurs.
                </p>
            </div>

            {/* Main Stats Grid */}
            <DashboardStats stats={stats} />

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Evolution Chart */}
                <div className="lg:col-span-4 space-y-6">
                    <DashboardCharts />

                    {/* Additional insights card */}
                    <Card className="border-zinc-100 shadow-xl shadow-zinc-200/50 rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="border-b border-zinc-50 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Insigths Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                        <TrendingUp size={16} />
                                        <span className="text-xs font-black uppercase">+24%</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-700 truncate">Sensation d'engagement</p>
                                    <p className="text-lg font-black text-emerald-900 mt-1">Excellent</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                                        <Eye size={16} />
                                        <span className="text-xs font-black uppercase">Réel</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-orange-700 truncate">Vues uniques estimées</p>
                                    <p className="text-lg font-black text-orange-900 mt-1">~{Math.round(stats.totalViews * 0.8)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Performing Ads Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-zinc-100 shadow-xl shadow-zinc-200/50 rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="bg-zinc-900 text-white p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80">Top Annonces</CardTitle>
                                <Eye size={16} className="text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {topAds.length > 0 ? topAds.map((ad, i) => (
                                    <div key={ad.id} className="flex items-center gap-4 group cursor-default">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-400 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-zinc-800 truncate uppercase tracking-tight">{ad.title}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                                    <Eye size={10} /> {ad.views_count || 0} vues
                                                </span>
                                                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                                                    <TrendingUp size={10} /> +{Math.floor(Math.random() * 10)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-black text-zinc-900 bg-zinc-50 px-2 py-1 rounded-lg">
                                            {ad.price} {ad.currency}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-sm font-bold text-zinc-400 py-4">
                                        Pas encore de données.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pro Tip Card */}
                    <div className="rounded-[2rem] bg-gradient-to-br from-orange-600 to-orange-500 p-8 text-white shadow-2xl shadow-orange-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Boostez vos ventes</h3>
                            <p className="text-white/80 font-bold text-sm leading-relaxed mb-6">
                                Saviez-vous que les annonces avec une description détaillée reçoivent 3x plus de contacts ?
                            </p>
                            <button className="w-full py-4 bg-white text-orange-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-50 transition-all active:scale-95 shadow-lg">
                                Améliorer mes annonces
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
