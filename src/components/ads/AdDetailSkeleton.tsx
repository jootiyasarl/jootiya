"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AdDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Top Header / Breadcrumbs Skeleton */}
            <div className="bg-white border-b border-zinc-200 h-16 flex items-center">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                    <Skeleton className="h-4 w-64 rounded-lg" />
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Column Left: Media & Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />

                        <div className="lg:hidden space-y-3 px-1">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-8 w-3/4 rounded-lg" />
                                <Skeleton className="h-6 w-24 rounded-lg" />
                            </div>
                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-100 sm:p-8 space-y-6">
                            <Skeleton className="h-6 w-32 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full rounded-lg" />
                                <Skeleton className="h-4 w-full rounded-lg" />
                                <Skeleton className="h-4 w-2/3 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-zinc-50 sm:grid-cols-3">
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Column Right: Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="hidden lg:block rounded-3xl bg-white p-8 shadow-sm border border-zinc-100 space-y-6">
                            <Skeleton className="h-8 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                            <Skeleton className="h-12 w-1/3 rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-100 space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32 rounded-lg" />
                                    <Skeleton className="h-4 w-24 rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
