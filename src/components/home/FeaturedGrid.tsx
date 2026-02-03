"use client";

import { AdCard } from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeaturedGridProps {
    title: string;
    ads: any[]; // Ideally stick to HomepageAd type
    viewAllLink?: string;
}

export function FeaturedGrid({ title, ads, viewAllLink }: FeaturedGridProps) {
    if (!ads || ads.length === 0) return null;

    return (
        <section className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                        {title}
                    </h2>
                    {viewAllLink && (
                        <Link href={viewAllLink}>
                            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                مشاهدة المزيد &larr;
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {ads.map((ad) => (
                        <AdCard key={ad.id} ad={ad} variant="default" href={`/ads/${ad.id}`} />
                    ))}
                </div>
            </div>
        </section>
    );
}
