export interface ListingCardProps {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  imageUrl?: string;
  sellerName?: string;
  badgeLabel?: string;
  href: string;
}

export interface ListingGridProps {
  items: ListingCardProps[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export interface MarketplaceSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export interface MarketplaceFilterSidebarProps {
  filters: {
    id: string;
    label: string;
    options: { label: string; value: string; count?: number }[];
    value: string[];
  }[];
  onChange: (filterId: string, value: string[]) => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

export interface SortDropdownProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export interface MarketplaceSearchLayoutProps {
  searchBarProps: MarketplaceSearchBarProps;
  filterSidebarProps: MarketplaceFilterSidebarProps;
  sortDropdownProps: SortDropdownProps;
  listingGridProps: ListingGridProps;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryActionClick?: () => void;
}
