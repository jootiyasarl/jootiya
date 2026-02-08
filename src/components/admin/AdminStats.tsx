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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue (GMV)</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-emerald-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +15.2% from last month
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-orange-500 flex items-center mt-1">
                        +{stats.growth.users}% new signups
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Ads</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalAds}</div>
                    <p className="text-xs text-purple-500 flex items-center mt-1">
                        +{stats.growth.ads}% vs last week
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Active Listings</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeAds}</div>
                    <p className="text-xs text-zinc-500 mt-1">
                        Current live inventory
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
