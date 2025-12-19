"use client";

import { useState } from "react";
import { MarketplaceSearchLayout } from "@/components/marketplace/search/MarketplaceSearchLayout";
import { EmptyState } from "@/components/feedback/EmptyState";
import type {
  ListingCardProps,
  MarketplaceFilterSidebarProps,
  MarketplaceSearchBarProps,
  SortDropdownProps,
} from "@/types/components/marketplace";

const MOCK_LISTINGS: ListingCardProps[] = [
  {
    id: "1",
    title: "Premium Storefront Theme",
    subtitle: "A high-converting theme for marketplace sellers.",
    price: "$59",
    rating: 4.8,
    ratingCount: 120,
    imageUrl: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
    sellerName: "Studio Nova",
    badgeLabel: "Featured",
    href: "#",
  },
  {
    id: "2",
    title: "Product Photography Package",
    subtitle: "Professional photos for your catalog.",
    price: "$199",
    rating: 4.6,
    ratingCount: 54,
    imageUrl: "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800",
    sellerName: "LensCraft",
    href: "#",
  },
];

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [filters, setFilters] = useState<MarketplaceFilterSidebarProps["filters"]>([
    {
      id: "category",
      label: "Category",
      options: [
        { label: "Themes", value: "themes", count: 12 },
        { label: "Services", value: "services", count: 32 },
      ],
      value: [],
    },
    {
      id: "price_tier",
      label: "Price tier",
      options: [
        { label: "Budget", value: "budget" },
        { label: "Standard", value: "standard" },
        { label: "Premium", value: "premium" },
      ],
      value: [],
    },
  ]);

  const searchBarProps: MarketplaceSearchBarProps = {
    query,
    onQueryChange: setQuery,
    onSubmit: () => {
      // hook into router/search params later
      console.log("Search:", query);
    },
  };

  const filterSidebarProps: MarketplaceFilterSidebarProps = {
    filters,
    onChange: (filterId, value) => {
      setFilters((prev) =>
        prev.map((filter) =>
          filter.id === filterId ? { ...filter, value } : filter,
        ),
      );
    },
  };

  const sortDropdownProps: SortDropdownProps = {
    value: sort,
    onChange: setSort,
    options: [
      { label: "Featured", value: "featured" },
      { label: "Price: Low to High", value: "price_asc" },
      { label: "Price: High to Low", value: "price_desc" },
      { label: "Top rated", value: "rating_desc" },
    ],
  };

  const listingGridItems = MOCK_LISTINGS; // later: filter/sort based on state

  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Marketplace
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Discover services and products across all tenants.
          </p>
        </div>
      </div>

      <MarketplaceSearchLayout
        searchBarProps={searchBarProps}
        filterSidebarProps={filterSidebarProps}
        sortDropdownProps={sortDropdownProps}
        listingGridProps={{
          items: listingGridItems,
          isLoading: false,
        }}
      />

      <div className="mx-auto mt-12 w-full max-w-4xl px-4">
        <EmptyState
          title="This is a demo marketplace page."
          description="Wire up this layout to your actual Supabase data, filters, and search params."
        />
      </div>
    </div>
  );
}
