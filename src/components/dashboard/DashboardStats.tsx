import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";

interface StatsProps {
    stats: {
        totalAds: number;
        approvedAds: number;
        pendingAds: number;
        revenue: number;
    };
}

export function DashboardStats({ stats }: StatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-md dark:bg-zinc-900/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Revenu total</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Basé sur les annonces approuvées</p>
                </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-md dark:bg-zinc-900/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total des annonces</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalAds}</div>
                    <p className="text-xs text-muted-foreground">Toutes les soumissions</p>
                </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-md dark:bg-zinc-900/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Actives</CardTitle>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.approvedAds}</div>
                    <p className="text-xs text-muted-foreground">En ligne actuellement</p>
                </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-md border border-white/20 shadow-md dark:bg-zinc-900/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingAds}</div>
                    <p className="text-xs text-muted-foreground">En cours de révision</p>
                </CardContent>
            </Card>
        </div>
    );
}
