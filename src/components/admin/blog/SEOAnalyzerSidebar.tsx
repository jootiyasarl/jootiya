"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, Search, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeSEO } from "@/lib/seo-analyzer";

interface SEOAnalyzerSidebarProps {
  title: string;
  content: string;
  description: string;
  keyword: string;
  slug: string;
}

export const SEOAnalyzerSidebar = ({ title, content, description, keyword, slug }: SEOAnalyzerSidebarProps) => {
  const analysis = analyzeSEO(title, content, description, keyword);
  const displaySlug = slug || "votre-slug-ici";

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className={cn(
        "p-6 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 shadow-2xl",
        getScoreColor(analysis.score)
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Score SEO</h3>
          <span className="text-3xl font-black">{analysis.score}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000 ease-out", getProgressColor(analysis.score))}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Google Preview */}
      <div className="p-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800/50 shadow-2xl space-y-6">
        <h3 className="text-lg font-black flex items-center gap-3 text-white border-b border-zinc-800/50 pb-5">
          <Search className="h-5 w-5 text-orange-500" />
          Aperçu Google
        </h3>
        <div className="bg-white p-6 rounded-2xl shadow-inner space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#202124]">
            <div className="w-7 h-7 bg-[#f1f3f4] rounded-full flex items-center justify-center">
              <Globe className="h-4 w-4 text-[#5f6368]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] leading-tight font-medium">jootiya.com</span>
              <span className="text-[10px] leading-tight text-[#5f6368]">https://jootiya.com › blog › {displaySlug}</span>
            </div>
          </div>
          <h4 className="text-[18px] text-[#1a0dab] font-medium hover:underline cursor-pointer leading-tight">
            {title || "Titre de votre article"}
          </h4>
          <p className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-2">
            <span className="text-[#70757a]">20 févr. 2026 — </span>
            {description || "La méta-description apparaîtra ici. Elle doit être engageante pour inciter au clic."}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="p-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800/50 shadow-2xl space-y-6">
        <h3 className="text-lg font-black flex items-center gap-3 text-white border-b border-zinc-800/50 pb-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          SEO Checklist
        </h3>
        <div className="space-y-4">
          {analysis.checks.map((check) => (
            <div key={check.id} className="flex items-start gap-3 group">
              {check.passed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500/50 shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
              )}
              <div className="space-y-1">
                <p className={cn(
                  "text-xs font-bold transition-colors",
                  check.passed ? "text-zinc-300" : "text-zinc-500"
                )}>
                  {check.label}
                </p>
                {!check.passed && (
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                    Priorité: {check.importance}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
