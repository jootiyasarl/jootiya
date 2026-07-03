import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAds } from '@/lib/db/ads';
import MarketplaceManager from '@/components/marketplace/MarketplaceManager';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { ListingSkeleton } from '@/components/ads/ListingSkeleton';
import { HorizontalCategoriesBar } from "@/components/marketplace/HorizontalCategoriesBar";
import { ShadowCategoryTracker } from "@/components/ads/ShadowCategoryTracker";

const CATEGORY_LABELS: Record<string, string> = {
    "electronics": "Électronique",
    "home-furniture": "Maison & Ameublement",
    "vehicles": "Véhicules & Transport",
    "fashion": "Mode & Chaussures",
    "tools-equipment": "Outils & Équipement",
    "hobbies": "Loisirs & Divertissement",
    "animals": "Animaux",
    "books": "Livres & Études",
    "used-clearance": "Occasions",
    "other": "Autres",
};

export async function generateStaticParams() {
    return Object.keys(CATEGORY_LABELS).map((slug) => ({
        slug: slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const label = CATEGORY_LABELS[resolvedParams.slug] || "Catégorie";
    return {
        title: `Acheter ${label} d'occasion au Maroc | Jootiya`,
        description: `Découvrez les meilleures offres sur ${label} au Maroc. Achetez et vendez en toute sécurité sur Jootiya, la plateforme n°1 d'occasion.`,
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const supabase = createSupabaseServerClient();
    const category = resolvedParams.slug;
    
    const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
    const minPrice = typeof resolvedSearchParams.minPrice === 'string' ? Number(resolvedSearchParams.minPrice) : undefined;
    const maxPrice = typeof resolvedSearchParams.maxPrice === 'string' ? Number(resolvedSearchParams.maxPrice) : undefined;
    const sort = typeof resolvedSearchParams.sort === 'string' ? (resolvedSearchParams.sort as any) : 'newest';
    const city = typeof resolvedSearchParams.city === 'string' ? resolvedSearchParams.city : undefined;

    const { ads, error } = await getAds(supabase, {
        query,
        category,
        minPrice,
        maxPrice,
        sort,
        city
    });

    return (
        <>
            <ShadowCategoryTracker categorySlug={category} />
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
                                <span className="font-bold text-zinc-900 dark:text-white">{CATEGORY_LABELS[category] || category}</span>
                            </li>
                        </ol>
                    </nav>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                        {CATEGORY_LABELS[category] || category} <span className="text-orange-500">au Maroc</span>
                    </h1>
                </div>

                <Suspense fallback={<ListingSkeleton />}>
                    <MarketplaceManager ads={ads || []} />
                </Suspense>
            </div>
        </>
    );
}
