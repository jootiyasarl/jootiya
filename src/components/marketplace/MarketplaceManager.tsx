"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MarketplaceSearchLayout } from "@/components/marketplace/search/MarketplaceSearchLayout";
import { ListingCardProps } from "@/types/components/marketplace";
import { useCallback, useState } from "react";

// Transform Supabase Ad to ListingCardProps
function transformAdToCard(ad: any): ListingCardProps {
    if (!ad) return { id: 'error', title: 'Ad Error', price: '0', imageUrl: '', sellerName: '', href: '#' };

    // Safety check for profiles join (sometimes can be an array depending on Supabase version/logic)
    const profile = Array.isArray(ad.profiles) ? ad.profiles[0] : ad.profiles;

    return {
        id: ad.id || Math.random().toString(),
        title: ad.title || 'Sans titre',
        subtitle: ad.description || '',
        price: `${ad.currency || 'MAD'} ${ad.price || 0}`,
        rating: 0,
        ratingCount: 0,
        imageUrl: ad.image_urls?.[0] || ad.images?.[0] || '/placeholder-ad.jpg',
        sellerName: profile?.full_name || profile?.username || 'Vendeur Jootiya',
        href: ad.slug ? `/ads/${ad.slug}` : `/ads/${ad.id}`,
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
