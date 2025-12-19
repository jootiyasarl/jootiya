"use client";

import type { MarketplaceFilterSidebarProps } from "@/types/components/marketplace";

export function MarketplaceFilterSidebar({ filters, onChange }: MarketplaceFilterSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 space-y-6 rounded-2xl border bg-white p-4 text-sm shadow-sm lg:block">
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
