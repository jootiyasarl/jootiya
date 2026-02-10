"use client";

import type { SortDropdownProps } from "@/types/components/marketplace";

export function SortDropdown({ value, options, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <span>Trier par</span>
      <select
        className="rounded-full border bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
