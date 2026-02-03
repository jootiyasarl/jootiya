"use client";

import type { MarketplaceSearchBarProps } from "@/types/components/marketplace";
import { Search } from "lucide-react";

export function MarketplaceSearchBar({
  query,
  onQueryChange,
  onSubmit,
  placeholder = "Rechercher des services, des produits ou des vendeurs...",
}: MarketplaceSearchBarProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex w-full items-center relative group max-w-xl">
      <input
        className="w-full bg-white border border-zinc-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-xl py-3 pr-12 pl-4 text-sm transition-all outline-none"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="absolute right-2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}
