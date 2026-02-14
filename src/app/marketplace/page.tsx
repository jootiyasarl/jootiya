import { Suspense } from 'react';
import Link from 'next/link';
import { getAds } from '@/lib/db/ads';
import MarketplaceManager from '@/components/marketplace/MarketplaceManager';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { ListingSkeleton } from '@/components/ads/ListingSkeleton';
import { HorizontalCategoriesBar } from '@/components/marketplace/HorizontalCategoriesBar';

export const metadata = {
  title: 'Marché - Jootiya',
  description: 'Achetez et vendez tout sur le marché Jootiya.',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createSupabaseServerClient();

  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : undefined;
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as any) : 'newest';
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

  const { ads, count, error } = await getAds(supabase, {
    // query,
    // category,
    // minPrice,
    // maxPrice,
    // sort,
    // city
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 max-w-md">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Erreur de chargement</h2>
          <p className="text-zinc-500 mb-6">
            Désolé, une erreur est survenue lors de la récupération des annonces.
          </p>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left overflow-auto max-h-60">
            <p className="font-mono text-xs text-red-800 font-bold">Message: {error.message}</p>
            {error.details && <p className="font-mono text-xs text-red-700 mt-1">Details: {error.details}</p>}
            {error.hint && <p className="font-mono text-xs text-red-700 mt-1">Hint: {error.hint}</p>}
          </div>
          <Link href="/marketplace" className="inline-block px-6 py-2 bg-orange-600 text-white rounded-xl font-bold">Ressayer</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Horizontal Categories Bar */}
      <HorizontalCategoriesBar />

      <div className="min-h-screen bg-white dark:bg-zinc-950 pb-24 pt-4">
        <Suspense fallback={<ListingSkeleton />}>
          <MarketplaceManager ads={ads || []} />
        </Suspense>
      </div>
    </>
  );
}
