"use client";

import type { MarketplaceFilterSidebarProps } from "@/types/components/marketplace";
import { MOROCCAN_CITIES } from "@/lib/constants/cities";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketplaceFilterSidebar({ filters, onChange, selectedCity, onCityChange, className }: MarketplaceFilterSidebarProps & { className?: string }) {
  return (
    <aside className={cn("hidden w-64 shrink-0 space-y-6 rounded-2xl border bg-white p-4 text-sm shadow-sm lg:block", className)}>
      {/* City Filter */}
      <div className="space-y-3 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-zinc-500">
          <MapPin className="w-3.5 h-3.5" />
          Localisation
        </div>
        <div className="relative">
          <select
            value={selectedCity || ""}
            onChange={(e) => onCityChange?.(e.target.value)}
            className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
          >
            <option value="">Toute le Maroc</option>
            {MOROCCAN_CITIES.map((region) => (
              <optgroup key={region.region} label={region.region}>
                {region.cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {filters.map((filter) => (
        <div key={filter.id} className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {filter.label}
          </div>
          <div className="space-y-1">
            {filter.options.map((option) => {
              const checked = filter.value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1 text-xs hover:bg-zinc-50"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? filter.value.filter((v) => v !== option.value)
                          : [...filter.value, option.value];
                        onChange(filter.id, next);
                      }}
                    />
                    <span className="text-zinc-700">{option.label}</span>
                  </span>
                  {option.count !== undefined ? (
                    <span className="text-[11px] text-zinc-400">{option.count}</span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
