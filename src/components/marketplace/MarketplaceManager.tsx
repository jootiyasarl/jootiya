"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MarketplaceSearchLayout } from "@/components/marketplace/search/MarketplaceSearchLayout";
import { ListingCardProps } from "@/types/components/marketplace";
import { useCallback, useEffect, useMemo, useState } from "react";

// Transform Supabase Ad to ListingCardProps
import { AdCard } from "@/components/AdCard";
import { Package } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { shadowTracker } from "@/lib/shadow-tracker";
import { MarketplaceSearchBar } from "@/components/marketplace/search/MarketplaceSearchBar";

// Transform Supabase Ad to AdCard expected format
function transformAdToCard(ad: any) {
    if (!ad) return null;

    const profile = Array.isArray(ad.profiles) ? ad.profiles[0] : ad.profiles;
    
    let createdAtLabel: string | undefined;
    if (ad.created_at) {
        const d = new Date(ad.created_at);
        if (!Number.isNaN(d.getTime())) {
            const dateStr = d.toLocaleDateString("fr-FR", { month: 'short', day: 'numeric' });
            const timeStr = d.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
            createdAtLabel = `${dateStr} à ${timeStr}`;
        }
    }

    const currency = typeof ad.currency === 'string' ? ad.currency.trim() : "MAD";
    const priceLabel = ad.price != null ? `${ad.price} ${currency}` : "—";

    return {
        id: ad.id,
        title: ad.title || 'Sans titre',
        price: priceLabel,
        location: `${ad.neighborhood ? ad.neighborhood + ', ' : ''}${ad.city || 'Maroc'}`,
        createdAt: createdAtLabel,
        imageUrl: ad.image_urls?.[0] || ad.images?.[0],
        isFeatured: Boolean(ad.is_featured),
        status: ad.status
    };
}

export default function MarketplaceManager({ ads: initialAds }: { ads: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeQuery = searchParams.get("q") || "";
    const activeCity = searchParams.get("city") || "";
    const activeCategory = searchParams.get("category") || "";
    const activeSort = searchParams.get("sort") || "newest";

    const [allAds] = useState(initialAds);
    const [query, setQuery] = useState(activeQuery);

    // Update internal query state when URL changes
    useEffect(() => {
        setQuery(activeQuery);
    }, [activeQuery]);

    // Client-side filtering and sorting
    const filteredAds = useMemo(() => {
        let results = [...allAds];

        // 1. Filter by City (Case-insensitive)
        if (activeCity && activeCity !== "Toutes les villes") {
            results = results.filter(ad => 
                ad.city && ad.city.toLowerCase().includes(activeCity.toLowerCase())
            );
        }

        // 2. Filter by Category (UUID or Slug)
        if (activeCategory && activeCategory !== "all" && activeCategory !== "Tout") {
            results = results.filter(ad => 
                ad.category_id === activeCategory || 
                (ad.category && ad.category.toLowerCase() === activeCategory.toLowerCase())
            );
        }

        // 3. Filter by Search Query (Title or Description)
        if (activeQuery) {
            const searchLower = activeQuery.toLowerCase();
            results = results.filter(ad => 
                (ad.title && ad.title.toLowerCase().includes(searchLower)) ||
                (ad.description && ad.description.toLowerCase().includes(searchLower))
            );
        }

        // 4. Sort Results
        results.sort((a, b) => {
            if (activeSort === "price_asc") return (a.price || 0) - (b.price || 0);
            if (activeSort === "price_desc") return (b.price || 0) - (a.price || 0);
            // Default to newest
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return results;
    }, [allAds, activeCity, activeCategory, activeQuery, activeSort]);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
            params.set("q", query.trim());
        } else {
            params.delete("q");
        }
        // Use shallow: true if available in your Next.js version to avoid full reload
        // router.push(`/marketplace/search?${params.toString()}`, { shallow: true });
        router.push(`/marketplace/search?${params.toString()}`);
    };

    const handleCityChange = (city: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (city && city !== "Toutes les villes") {
            params.set("city", city);
        } else {
            params.delete("city");
        }
        router.push(`/marketplace/search?${params.toString()}`);
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 md:px-6">
            <div className="flex flex-col gap-6 pt-2 md:flex-row md:items-center md:justify-between">
                <MarketplaceSearchLayout
                    searchBarProps={{
                        query,
                        onQueryChange: setQuery,
                        onSubmit: handleSearch,
                    }}
                    filterSidebarProps={{
                        filters: [],
                        onChange: () => { },
                        selectedCity: activeCity,
                        onCityChange: handleCityChange
                    }}
                    sortDropdownProps={{
                        value: searchParams.get("sort") || "featured",
                        onChange: (val) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("sort", val);
                            router.push(`/marketplace?${params.toString()}`);
                        },
                        options: [
                            { label: "Plus récents", value: "newest" },
                            { label: "Prix : Croissant", value: "price_asc" },
                            { label: "Prix : Décroissant", value: "price_desc" },
                        ]
                    }}
                    listingGridProps={{
                        items: [], // Passing empty since we will render grid here for better control
                        isLoading: false,
                    }}
                />

                <MarketplaceSearchBar
                    query={query}
                    onQueryChange={setQuery}
                    onSubmit={handleSearch}
                    ads={allAds as any}
                    selectedCity={activeCity || undefined}
                    selectedCategory={activeCategory || undefined}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-20">
                {filteredAds.length > 0 ? (
                    filteredAds.map((ad) => {
                        const formattedAd = transformAdToCard(ad);
                        if (!formattedAd) return null;
                        return (
                            <AdCard 
                                key={ad.id} 
                                ad={formattedAd as any} 
                                href={`/ads/${ad.id}`}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-10 h-10 text-zinc-300" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Aucune annonce trouvée</h3>
                        <p className="text-zinc-500 max-w-sm">
                            Il n'y a pas d'annonces correspondant à vos critères pour le moment. Essayez de modifier vos filtres et votre recherche.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
