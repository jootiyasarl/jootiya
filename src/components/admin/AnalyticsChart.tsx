"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users } from "lucide-react";

interface AnalyticsChartProps {
  data: { date: string; views: number }[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const totalViews = useMemo(() => data.reduce((sum, item) => sum + item.views, 0), [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Trafic Total (30j)</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-white tracking-tighter">{totalViews.toLocaleString()}</h4>
            <span className="text-xs font-bold text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12%
            </span>
          </div>
        </div>
        <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-xl">
          <Users className="h-5 w-5 text-orange-500" />
        </div>
      </div>

      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#09090b', 
                border: '1px solid #27272a', 
                borderRadius: '1rem',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#fff'
              }}
              itemStyle={{ color: '#f97316' }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
