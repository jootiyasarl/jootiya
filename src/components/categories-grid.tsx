import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  slug: string;
  name: string;
  icon?: ReactNode;
  adsCount?: number;
}

export interface CategoriesGridProps {
  categories: CategoryItem[];
  className?: string;
}

function formatAdsCount(count: number | undefined): string {
  if (typeof count !== "number" || Number.isNaN(count)) {
    return "— ads";
  }
  if (count === 0) return "No ads yet";
  if (count === 1) return "1 ad";
  return `${count} ads`;
}

export function CategoriesGrid({
  categories,
  className,
}: CategoriesGridProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => {
          const href = `/category/${encodeURIComponent(category.slug)}`;

          return (
            <Link key={category.slug} href={href} className="group block">
              <Card className="h-full cursor-pointer rounded-2xl border-zinc-100 bg-white text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-200 hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-2 p-3.5 sm:p-4">
                  <div className="flex items-center gap-2">
                    {category.icon ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-lg">
                        {category.icon}
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-zinc-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="mt-auto text-xs text-zinc-500">
                    {formatAdsCount(category.adsCount)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
