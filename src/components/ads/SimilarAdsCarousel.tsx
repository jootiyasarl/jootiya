"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { AdCard } from "@/components/ads/AdCard";

export function SimilarAdsCarousel({ ads }: { ads: any[] }) {
  const slides = (ads || []).slice(0, 6);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!slides.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {slides.map((simAd: any) => (
            <div
              key={simAd.id}
              className="flex-[0_0_78%] sm:flex-[0_0_45%] md:flex-[0_0_32%] lg:flex-[0_0_24%]"
            >
              <AdCard
                ad={{
                  id: simAd.id,
                  title: simAd.title,
                  price: simAd.price,
                  currency: simAd.currency,
                  images: simAd.image_urls || simAd.images || null,
                  location: simAd.city || null,
                  created_at: simAd.created_at,
                  status: simAd.status,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm items-center justify-center text-zinc-800 hover:text-orange-600 transition-colors"
        aria-label="Précédent"
      >
        <span className="text-lg font-black">‹</span>
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm items-center justify-center text-zinc-800 hover:text-orange-600 transition-colors"
        aria-label="Suivant"
      >
        <span className="text-lg font-black">›</span>
      </button>
    </div>
  );
}
