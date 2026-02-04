import { Suspense } from 'react';
import Link from 'next/link';
import { getAds } from '@/lib/db/ads';
import MarketplaceManager from '@/components/marketplace/MarketplaceManager';
import { createSupabaseServerClient } from '@/lib/supabase';

export const metadata = {
  title: 'Marché - Jootiya',
  description: 'Achetez et vendez tout sur le marché Jootiya.',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; seller_id?: string; category?: string }>;
}) {
  const params = await searchParams; // Await in Next.js 15+
  const supabase = createSupabaseServerClient();
  const { ads, error } = await getAds(supabase, {
    query: params.q,
    sort: params.sort as any,
    sellerId: params.seller_id,
    category: params.category
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-zinc-100 max-w-md">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Erreur de chargement</h2>
          <p className="text-zinc-500 mb-6">Désolé, une erreur est survenue lors de la récupération des annonces.</p>
          <Link href="/marketplace" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Ressayer</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Marché
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Découvrez de superbes offres autour de vous.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Chargement du marché...</div>}>
        <MarketplaceManager ads={ads || []} />
      </Suspense>
    </div>
  );
}
