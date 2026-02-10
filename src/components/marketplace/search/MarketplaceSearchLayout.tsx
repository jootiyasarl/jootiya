"use client";

import type { MarketplaceSearchLayoutProps } from "@/types/components/marketplace";
import { MarketplaceSearchBar } from "./MarketplaceSearchBar";
import { MarketplaceFilterSidebar } from "../filters/MarketplaceFilterSidebar";
import { SortDropdown } from "../filters/SortDropdown";
import { ListingGrid } from "../listing/ListingGrid";
import { MobileFilterTrigger } from "../filters/MobileFilterTrigger";

export function MarketplaceSearchLayout({
  searchBarProps,
  filterSidebarProps,
  sortDropdownProps,
  listingGridProps,
}: MarketplaceSearchLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-12">
      <div className="flex flex-col gap-6 pt-6 md:flex-row md:items-center md:justify-between">
        <MarketplaceSearchBar {...searchBarProps} />
        <div className="flex items-center gap-2 md:gap-4">
          <MobileFilterTrigger {...filterSidebarProps} />
          <SortDropdown {...sortDropdownProps} />
        </div>
      </div>

      <div className="flex gap-6">
        <MarketplaceFilterSidebar {...filterSidebarProps} />
        <div className="flex-1">
          <ListingGrid {...listingGridProps} />
        </div>
      </div>
    </div>
  );
}
