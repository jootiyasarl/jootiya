import { Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdCard, type Ad } from '@/components/ads/AdCard';

async function RecentAdsList() {
    // Fetch approved ads from Supabase
    const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8);

    if (error) {
        console.error('Error fetching ads:', error);
        return <p className="text-red-500">Failed to load ads.</p>;
    }

    if (!ads || ads.length === 0) {
        return (
            <div className="col-span-full py-12 text-center text-gray-500">
                No active listings found. Be the first to post!
            </div>
        );
    }

    return (
        <>
            {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad as unknown as Ad} />
            ))}
        </>
    );
}

export default function FeaturedAds() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Fresh Recommendations
                    </h2>
                    <a href="/marketplace" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        View All &rarr;
                    </a>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Suspense fallback={<AdsSkeleton />}>
                        <RecentAdsList />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}

function AdsSkeleton() {
    return Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[320px] rounded-2xl bg-gray-200 animate-pulse dark:bg-zinc-800" />
    ));
}
