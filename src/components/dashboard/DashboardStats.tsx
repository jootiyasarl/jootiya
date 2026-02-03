import { Card } from "@/components/ui/card";
import { DollarSign, FileText, CheckCircle, Clock, TrendingUp, Users, ShoppingBag, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsProps {
    stats: {
        totalAds: number;
        approvedAds: number;
        pendingAds: number;
        revenue: number;
    };
}

export function DashboardStats({ stats }: StatsProps) {
    const items = [
        {
            label: "Revenu total",
            value: `${stats.revenue.toLocaleString()} MAD`,
            sub: "Basé sur les ventes",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            label: "Total annonces",
            value: stats.totalAds,
            sub: "Toutes périodes",
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            label: "Annonces actives",
            value: stats.approvedAds,
            sub: "Visibles sur le site",
            icon: CheckCircle,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100"
        },
        {
            label: "Vues totales",
            value: "2,4k",
            sub: "+12% cette semaine",
            icon: Eye,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100"
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => (
                <Card key={idx} className={cn(
                    "relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-200/50 border-zinc-100 rounded-2xl p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800"
                )}>
                    {/* Decorative Background Icon */}
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <item.icon className="w-24 h-24" />
                    </div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", item.bg, item.color)}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                                    {item.label}
                                </p>
                                <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                                    {item.value}
                                </div>
                                <p className="text-[10px] font-bold text-zinc-500 mt-1 flex items-center gap-1">
                                    {item.label === "Vues totales" && <TrendingUp size={10} className="text-emerald-500" />}
                                    {item.sub}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
