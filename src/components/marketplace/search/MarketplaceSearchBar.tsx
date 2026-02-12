"use client";

import { useState, useEffect, useRef } from "react";
import type { MarketplaceSearchBarProps } from "@/types/components/marketplace";
import { Search, Loader2 } from "lucide-react";

interface AutocompleteSuggestion {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
}

export function MarketplaceSearchBar({
  query,
  onQueryChange,
  onSubmit,
  placeholder = "Rechercher des services, des produits ou des vendeurs...",
}: MarketplaceSearchBarProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Autocomplete error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
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
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="absolute right-2 p-2 bg-orange-600 rounded-lg text-white hover:bg-orange-700 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
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
                <img
                  src={suggestion.image_url}
                  alt={suggestion.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
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
