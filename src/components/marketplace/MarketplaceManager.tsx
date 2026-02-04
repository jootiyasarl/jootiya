"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MarketplaceSearchLayout } from "@/components/marketplace/search/MarketplaceSearchLayout";
import { ListingCardProps } from "@/types/components/marketplace";
import { useCallback, useState } from "react";

// Transform Supabase Ad to ListingCardProps
function transformAdToCard(ad: any): ListingCardProps {
    return {
        id: ad.id,
        title: ad.title,
        subtitle: ad.description, // truncate in UI if needed
        price: `${ad.currency || 'MAD'} ${ad.price}`,
        rating: 0, // Placeholder
        ratingCount: 0,
        imageUrl: ad.image_urls?.[0] || '/placeholder-ad.jpg',
        sellerName: ad.profiles?.full_name || 'Vendeur inconnu',
        href: `/ads/${ad.id}`, // Fixed href to match ad detail route
    };
}

export default function MarketplaceManager({ ads }: { ads: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }
        router.push(`/marketplace?${params.toString()}`);
    };

    const formattedAds = ads.map(transformAdToCard);

    return (
        <MarketplaceSearchLayout
            searchBarProps={{
                query,
                onQueryChange: setQuery,
                onSubmit: handleSearch,
            }}
            filterSidebarProps={{
                filters: [], // Add real filters later
                onChange: () => { },
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
                items: formattedAds,
                isLoading: false,
            }}
        />
    );
}
