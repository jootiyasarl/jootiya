import { AdGridSkeleton } from "@/components/ads/AdCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Hero Skeleton (Optional if Hero is static, but let's keep it clean) */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/3 rounded-xl mx-auto md:mx-0" />
                <Skeleton className="h-32 w-full rounded-[2rem]" />
            </div>

            {/* Categories Skeleton */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                        <Skeleton className="h-14 w-14 rounded-2xl" />
                        <Skeleton className="h-3 w-12 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Ads Grid Skeleton */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-40 rounded-xl" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <AdGridSkeleton count={12} />
            </div>
        </div>
    );
}
