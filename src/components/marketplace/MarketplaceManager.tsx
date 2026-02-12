"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MarketplaceSearchLayout } from "@/components/marketplace/search/MarketplaceSearchLayout";
import { ListingCardProps } from "@/types/components/marketplace";
import { useCallback, useState } from "react";

// Transform Supabase Ad to ListingCardProps
import { AdCard } from "@/components/AdCard";
import { Package } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

export default function MarketplaceManager({ ads }: { ads: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get("q") || "";
    const activeCity = searchParams.get("city") || "";
    const activeCategory = searchParams.get("category") || "";
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

    const handleCityChange = (city: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (city) {
            params.set("city", city);
        } else {
            params.delete("city");
        }
        router.push(`/marketplace?${params.toString()}`);
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
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-20">
                {ads.length > 0 ? (
                    ads.map((ad) => {
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
                            Il n'y a pas d'annonces correspondant à vos critères pour le moment. Essayez de modifier vos filtres أو votre recherche.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
