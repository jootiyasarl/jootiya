"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MarketplaceSearchBarProps } from "@/types/components/marketplace";
import { Search } from "lucide-react";

import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/storageUtils";

interface AutocompleteSuggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  city?: string | null;
  category?: string | null;
}

type MarketplaceSearchBarLocalAd = {
  id: string;
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  image_urls?: string[] | null;
  images?: string[] | null;
  city?: string | null;
  category?: string | null;
};

export function MarketplaceSearchBar({
  query,
  onQueryChange,
  onSubmit,
  placeholder = "Rechercher des services, des produits ou des vendeurs...",
  ads,
  selectedCity,
  selectedCategory,
}: MarketplaceSearchBarProps & {
  ads?: MarketplaceSearchBarLocalAd[];
  selectedCity?: string;
  selectedCategory?: string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizeKey = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const suggestions = useMemo<AutocompleteSuggestion[]>(() => {
    const q = normalizeKey(query);
    if (!ads || q.length < 2) return [];

    const cityKey = selectedCity ? normalizeKey(selectedCity) : "";
    const categoryKey = selectedCategory ? normalizeKey(selectedCategory) : "";

    return ads
      .filter((ad) => {
        const title = normalizeKey(String(ad.title || ""));
        if (!title.includes(q)) return false;

        if (cityKey) {
          const adCity = normalizeKey(String(ad.city || ""));
          if (adCity !== cityKey) return false;
        }

        if (categoryKey) {
          const adCat = normalizeKey(String(ad.category || ""));
          if (adCat !== categoryKey) return false;
        }

        return true;
      })
      .slice(0, 8)
      .map((ad) => ({
        id: String(ad.id),
        title: String(ad.title || ""),
        price: Number(ad.price || 0),
        currency: String(ad.currency || "MAD"),
        image_url: (ad.image_urls?.[0] || ad.images?.[0] || null) as any,
        city: ad.city || null,
        category: ad.category || null,
      }));
  }, [ads, query, selectedCity, selectedCategory]);

  const handleFocus = () => {
    if (suggestions.length > 0) setShowDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // Select the highlighted suggestion
        onQueryChange(suggestions[selectedIndex].title);
        setShowDropdown(false);
      }
      onSubmit();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (event.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    onQueryChange(suggestion.title);
    setShowDropdown(false);
    onSubmit();
  };

  return (
    <div className="flex w-full items-center relative group max-w-xl" ref={dropdownRef}>
      <input
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/30 rounded-2xl h-12 pr-14 pl-5 text-[15px] font-bold transition-all outline-none shadow-premium placeholder:text-zinc-400 placeholder:font-medium"
        type="search"
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="absolute right-2 p-2 bg-orange-600 rounded-lg text-white hover:bg-orange-700 transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Autocomplete Dropdown: Pro Glass Design */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 glass-frosted rounded-[1.5rem] shadow-premium overflow-hidden z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left ${index === selectedIndex ? "bg-blue-50" : ""
                }`}
            >
              {suggestion.image_url && (
                <div className="relative w-12 h-12 shrink-0">
                  <Image
                    src={getOptimizedImageUrl(suggestion.image_url, { width: 100, height: 100, quality: 75 })}
                    alt={suggestion.title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {suggestion.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {suggestion.price} {suggestion.currency}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
