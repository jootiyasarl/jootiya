import { Suspense } from 'react';
import { getAds } from '@/lib/db/ads';
import MarketplaceManager from '@/components/marketplace/MarketplaceManager';

export const metadata = {
  title: 'Marketplace - Jootiya',
  description: 'Buy and sell everything on Jootiya Marketplace.',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams; // Await in Next.js 15+
  const { ads } = await getAds({
    query: params.q,
    sort: params.sort as any
  });

  return (
    <div className="min-h-screen bg-zinc-50 pb-16 pt-8 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Marketplace
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Discover great deals around you.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading marketplace...</div>}>
        <MarketplaceManager ads={ads || []} />
      </Suspense>
    </div>
  );
}
