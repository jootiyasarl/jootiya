"use client";

import { AdGridSkeleton } from "@/components/ads/AdCardSkeleton";

export function ListingSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <AdGridSkeleton count={8} />
        </div>
    );
}
