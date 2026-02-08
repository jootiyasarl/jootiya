"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartData {
    name: string;
    total: number;
}

interface DashboardChartsProps {
    data?: ChartData[];
    title?: string;
}

export function DashboardCharts({
    data = [],
    title = "Activité des annonces"
}: DashboardChartsProps) {
    return (
        <Card className="col-span-4 bg-white/70 backdrop-blur-md border border-zinc-100 shadow-xl shadow-zinc-200/50 rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-zinc-50 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2 pt-6">
                <div className="h-[300px] w-full">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#A1A1AA"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.toUpperCase()}
                                />
                                <YAxis
                                    stroke="#A1A1AA"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderColor: '#f2f2f2',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    name="Annonces"
                                    stroke="#f97316"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-zinc-400 text-sm font-bold">
                            Aucune donnée d'activité disponible
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
