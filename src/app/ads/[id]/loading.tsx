import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Breadcrumbs Skeleton */}
            <div className="bg-white border-b border-zinc-200 h-14 flex items-center">
                <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                    <Skeleton className="h-4 w-64 rounded-lg" />
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Media Column */}
                    <div className="lg:col-span-8 space-y-8">
                        <Skeleton className="aspect-[4/3] sm:aspect-[16/9] w-full rounded-3xl" />
                        <div className="rounded-3xl bg-white p-8 space-y-4">
                            <Skeleton className="h-8 w-48 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full rounded-lg" />
                                <Skeleton className="h-4 w-full rounded-lg" />
                                <Skeleton className="h-4 w-2/3 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="rounded-3xl bg-white p-8 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24 rounded-lg" />
                                <Skeleton className="h-8 w-full rounded-xl" />
                            </div>
                            <Skeleton className="h-10 w-32 rounded-xl" />
                            <div className="space-y-3 pt-4">
                                <Skeleton className="h-14 w-full rounded-2xl" />
                                <Skeleton className="h-14 w-full rounded-2xl" />
                            </div>
                        </div>
                        <div className="rounded-3xl bg-white p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32 rounded-lg" />
                                    <Skeleton className="h-4 w-24 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
