"use client";

import type { SortDropdownProps } from "@/types/components/marketplace";

import { ChevronDown } from "lucide-react";

export function SortDropdown({ value, options, onChange }: SortDropdownProps) {
  return (
    <div className="relative flex items-center group">
      <select
        className="appearance-none h-12 pl-4 pr-10 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-zinc-700 shadow-sm focus:ring-4 focus:ring-orange-100 transition-all outline-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3.5 w-4 h-4 text-zinc-400 pointer-events-none group-hover:text-zinc-600 transition-colors" />
    </div>
  );
}
