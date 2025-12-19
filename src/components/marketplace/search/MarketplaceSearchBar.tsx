"use client";

import type { MarketplaceSearchBarProps } from "@/types/components/marketplace";

export function MarketplaceSearchBar({
  query,
  onQueryChange,
  onSubmit,
  placeholder = "Search services, products, or sellers...",
}: MarketplaceSearchBarProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex w-full items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
      <input
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800"
      >
        Search
      </button>
    </div>
  );
}
