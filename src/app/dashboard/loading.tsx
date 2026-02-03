import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="p-6 space-y-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-48 rounded-xl" />
                </div>
                <Skeleton className="h-12 w-32 rounded-2xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-3xl" />
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl p-8 border border-zinc-100 min-h-[400px] space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
