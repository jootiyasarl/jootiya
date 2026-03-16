import { Suspense } from 'react';
import { getAds } from '@/lib/db/ads';
import MarketplaceManager from '@/components/marketplace/MarketplaceManager';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { ListingSkeleton } from '@/components/ads/ListingSkeleton';
import { HorizontalCategoriesBar } from "@/components/marketplace/HorizontalCategoriesBar";

export const metadata = {
    title: 'Résultats de recherche | Jootiya',
    description: 'Découvrez les meilleures offres sur Jootiya au Maroc.',
};

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        category?: string;
        city?: string;
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
        page?: string;
    }>;
}

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
    const { q, category, city, minPrice, maxPrice, sort, page } = await searchParams;
    const supabase = createSupabaseServerClient();
    
    const currentPage = parseInt(page || "1");
    const ITEMS_PER_PAGE = 20;
    
    const { ads, count } = await getAds(supabase, {
        query: q,
        category: category === 'all' ? undefined : category,
        city: city === 'Toutes les villes' ? undefined : city,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: (sort as any) || 'newest',
    });

    return (
        <>
            <HorizontalCategoriesBar />
            
            <div className="min-h-screen bg-white dark:bg-zinc-950 pb-24 pt-4">
                <div className="mx-auto max-w-7xl px-4 md:px-6 mb-6">
                    <nav className="flex text-sm text-zinc-500 mb-4" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li><a href="/" className="hover:text-orange-600 transition-colors">Accueil</a></li>
                            <li className="flex items-center space-x-2">
                                <span className="text-zinc-300">/</span>
                                <a href="/marketplace" className="hover:text-orange-600 transition-colors">Marketplace</a>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="text-zinc-300">/</span>
                                <span className="font-bold text-zinc-900 dark:text-white">Recherche</span>
                            </li>
                        </ol>
                    </nav>
                    
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            {q ? (
                                <>Résultats pour <span className="text-orange-500">"{q}"</span></>
                            ) : (
                                <>Toutes les <span className="text-orange-500">annonces</span></>
                            )}
                        </h1>
                        <p className="text-sm text-zinc-500 font-bold">
                            {count || 0} annonces trouvées {city && city !== 'Toutes les villes' ? `à ${city}` : 'au Maroc'}
                        </p>
                    </div>
                </div>

                <Suspense fallback={<ListingSkeleton />}>
                    <MarketplaceManager ads={ads || []} />
                </Suspense>
            </div>
        </>
    );
}
