"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/storageUtils";

interface AdImageGalleryProps {
    images: string[];
}

export function AdImageGallery({ images }: AdImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                لا توجد صور متاحة
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Slider Container */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-100 shadow-sm md:aspect-video">
                <div className="h-full w-full cursor-grab active:cursor-grabbing" ref={emblaRef}>
                    <div className="flex h-full">
                        {images.map((src, index) => {
                            // Smart 20KB Blur Placeholder
                            const blurUrl = getOptimizedImageUrl(src, { width: 40, height: 40, quality: 10 });
                            return (
                                <div key={index} className="relative h-full w-full flex-[0_0_100%] min-w-0">
                                    <Image
                                        src={src}
                                        alt={`Product view ${index + 1}`}
                                        fill
                                        placeholder="blur"
                                        blurDataURL={blurUrl}
                                        priority={index === 0} // Airbnb LCP Trick: First image is priority
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                                        onClick={() => setIsLightboxOpen(true)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Pagination Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    currentIndex === i ? "w-4 bg-white shadow-md" : "w-1.5 bg-white/50"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Numerical Counter */}
                <div className="absolute right-4 bottom-4 rounded-xl bg-black/60 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md pointer-events-none uppercase tracking-widest border border-white/10">
                    {currentIndex + 1} / {images.length}
                </div>

                {/* Desktop Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-3 text-zinc-800 shadow-xl backdrop-blur-md transition-all hover:bg-white active:scale-95 group-hover:flex md:flex"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-3 text-zinc-800 shadow-xl backdrop-blur-md transition-all hover:bg-white active:scale-95 group-hover:flex md:flex"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Full Screen Trigger */}
                <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute left-4 bottom-4 rounded-full bg-white/90 p-2.5 text-zinc-800 shadow-xl backdrop-blur-md transition-all hover:bg-white active:scale-95 z-10 hidden md:flex"
                >
                    <Maximize2 className="h-5 w-5" />
                </button>
            </div>

            {/* Thumbnails Row (Airbnb Style) */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi?.scrollTo(index)}
                            className={cn(
                                "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all md:w-full",
                                currentIndex === index
                                    ? "border-orange-600 scale-95"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={getOptimizedImageUrl(image, { width: 150, height: 150 })}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-in fade-in duration-300">
                    <div className="flex items-center justify-between p-4 z-50 bg-gradient-to-b from-black/50 to-transparent">
                        <span className="text-white text-xs font-black uppercase tracking-[0.3em]">معاينة التفاصيل</span>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="rounded-full bg-white/10 p-3 text-white backdrop-blur-xl hover:bg-white/20 transition-all active:scale-90"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                        <Image
                            src={images[currentIndex]}
                            alt="Full screen view"
                            fill
                            className="object-contain"
                            quality={100}
                        />

                        {images.length > 1 && (
                            <>
                                <button onClick={() => setCurrentIndex(p => (p - 1 + images.length) % images.length)} className="absolute left-4 p-4 text-white/50 hover:text-white transition-colors">
                                    <ChevronLeft className="h-10 w-10" />
                                </button>
                                <button onClick={() => setCurrentIndex(p => (p + 1) % images.length)} className="absolute right-4 p-4 text-white/50 hover:text-white transition-colors">
                                    <ChevronRight className="h-10 w-10" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="p-10 flex justify-center gap-2 overflow-x-auto bg-gradient-to-t from-black/50 to-transparent">
                        {images.map((_, i) => (
                            <div key={i} className={cn("h-1 rounded-full transition-all", currentIndex === i ? "w-8 bg-orange-500" : "w-4 bg-white/20")} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
