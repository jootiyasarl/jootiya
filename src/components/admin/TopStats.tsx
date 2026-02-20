"use client";

import React from "react";
import { Monitor, Smartphone, Globe } from "lucide-react";

interface TopStatsProps {
  topPages: { path: string; views: number }[];
  deviceStats: { mobile: number; desktop: number };
}

export function TopStats({ topPages, deviceStats }: TopStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Top Pages Card */}
      <div className="p-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800/50 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-500 mb-6 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Pages les plus visitées
        </h3>
        <div className="space-y-4">
          {topPages.map((page, i) => (
            <div key={page.path} className="flex items-center justify-between group/item">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-700 w-4">{i + 1}</span>
                <span className="text-xs font-bold text-zinc-300 truncate max-w-[180px] group-hover/item:text-orange-500 transition-colors">
                  {page.path === "/" ? "Accueil" : page.path}
                </span>
              </div>
              <span className="text-[10px] font-black text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-lg">
                {page.views} vues
              </span>
            </div>
          ))}
          {topPages.length === 0 && (
            <p className="text-xs text-zinc-600 italic">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Device Stats Card */}
      <div className="p-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800/50 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Type d'appareils
        </h3>
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-300">Mobile</span>
              </div>
              <span className="text-xl font-black text-white">{deviceStats.mobile}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${deviceStats.mobile}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-300">Desktop</span>
              </div>
              <span className="text-xl font-black text-white">{deviceStats.desktop}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000" 
                style={{ width: `${deviceStats.desktop}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
