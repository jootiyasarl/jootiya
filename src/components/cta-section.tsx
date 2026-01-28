"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CallToActionSectionProps {
  className?: string;
  createAdHref?: string;
  browseHref?: string;
}

export function CallToActionSection({
  className,
  createAdHref = "/dashboard/ads/create",
  browseHref = "/marketplace",
}: CallToActionSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 px-6 py-8 text-zinc-50 shadow-lg sm:px-10 sm:py-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18)_0,_transparent_50%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.2)_0,_transparent_55%)] opacity-80" />

      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3 sm:space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
            جاهز تبيع؟
          </p>
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
            بيع شي حاجة اليوم
          </h2>
          <p className="max-w-md text-sm text-zinc-200 sm:text-base">
            نشر إعلان مجاني في أقل من دقيقة، وخلي الناس القريبة منك تكتشف عروضك
            بسهولة. ما تحتاج لا بطاقة بنكية ولا تعقيدات  بس صوّر، وصف، وانشر.
          </p>
        </div>

        <div className="space-y-3 text-left sm:text-right">
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <Link href={createAdHref} className="inline-flex">
              <Button
                size="lg"
                className="min-w-[150px] bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/40 hover:bg-amber-300"
              >
                Create Ad
              </Button>
            </Link>
            <Link href={browseHref} className="inline-flex">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[150px] border-zinc-500 bg-zinc-900/50 text-zinc-50 hover:bg-zinc-800/80 hover:text-zinc-50"
              >
                Browse Near You
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-zinc-300">
            خفف الفوضى في دارك، وربح شوية فلوس من الحوايج اللي ما بقاوش
            مستعملين عندك.
          </p>
        </div>
      </div>
    </section>
  );
}
