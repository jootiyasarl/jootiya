import { Skeleton } from "@/components/ui/skeleton";

export function AdCardSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-10 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-5 w-1/4 rounded-lg" />
            </div>
        </div>
    );
}

export function AdGridSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: count }).map((_, i) => (
                <AdCardSkeleton key={i} />
            ))}
        </div>
    );
}
