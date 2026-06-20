"use client";

import type { MarketplaceSearchLayoutProps } from "@/types/components/marketplace";
import { MarketplaceFilterSidebar } from "../filters/MarketplaceFilterSidebar";
import { SortDropdown } from "../filters/SortDropdown";
import { MobileFilterTrigger } from "../filters/MobileFilterTrigger";

export function MarketplaceSearchLayout({
  filterSidebarProps,
  sortDropdownProps,
}: MarketplaceSearchLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12">
      <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between lg:gap-6">
        <div className="flex items-center gap-3">
          <MobileFilterTrigger {...filterSidebarProps} />
          <SortDropdown {...sortDropdownProps} />
        </div>
      </div>

      <div className="flex gap-6">
        <MarketplaceFilterSidebar {...filterSidebarProps} />
      </div>
    </div>
  );
}
