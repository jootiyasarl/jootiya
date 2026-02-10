"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface NoResultsFallbackProps {
    searchQuery?: string;
    category?: string;
    city?: string;
}

interface SuggestedAd {
    id: string;
    seller_id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    image_urls: string[];
    city: string;
    neighborhood: string;
    category: string;
    created_at: string;
    views_count: number;
}

export function NoResultsFallback({ searchQuery, category, city }: NoResultsFallbackProps) {
    const [suggestedAds, setSuggestedAds] = useState<SuggestedAd[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            const supabase = createSupabaseBrowserClient();

            try {
                const { data, error } = await supabase.rpc("get_similar_ads", {
                    search_category: category || null,
                    search_city: city || null,
                    result_limit: 8,
                });

                if (error) {
                    console.error("Error fetching similar ads:", error);
                } else {
                    setSuggestedAds(data || []);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [category, city]);

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-zinc-500 mt-4">جاري البحث عن همزات مقترحة...</p>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* No Results Message */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                    لم نجد نتائج مطابقة
                </h2>
                {searchQuery && (
                    <p className="text-zinc-600 mb-4">
                        لا توجد نتائج للبحث عن &quot;{searchQuery}&quot;
                    </p>
                )}
                <p className="text-zinc-500 text-sm">
                    جرب تعديل كلمات البحث أو تصفح الهمزات المقترحة أدناه
                </p>
            </div>

            {/* Suggested Ads */}
            {suggestedAds.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        همزات مقترحة لك
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {suggestedAds.map((ad) => (
                            <Link
                                key={ad.id}
                                href={`/ads/${ad.id}`}
                                className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Image */}
                                {ad.image_urls && ad.image_urls.length > 0 && (
                                    <div className="relative aspect-square">
                                        <img
                                            src={ad.image_urls[0]}
                                            alt={ad.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-4">
                                    <h4 className="font-semibold text-zinc-900 text-sm mb-1 line-clamp-2">
                                        {ad.title}
                                    </h4>
                                    <p className="text-orange-600 font-bold text-lg mb-2">
                                        {ad.price} {ad.currency}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{ad.city}</span>
                                        {ad.neighborhood && (
                                            <>
                                                <span>•</span>
                                                <span>{ad.neighborhood}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* No Suggestions Either */}
            {suggestedAds.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-zinc-500 mb-4">لا توجد همزات مقترحة حالياً</p>
                    <Link
                        href="/marketplace"
                        className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        تصفح جميع الهمزات
                    </Link>
                </div>
            )}
        </div>
    );
}
