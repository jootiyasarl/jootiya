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
    const [lightboxRef, lightboxApi] = useEmblaCarousel({ loop: true });

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    const onLightboxSelect = useCallback(() => {
        if (!lightboxApi) return;
        setCurrentIndex(lightboxApi.selectedScrollSnap());
    }, [lightboxApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        return () => { emblaApi.off("select", onSelect); };
    }, [emblaApi, onSelect]);

    useEffect(() => {
        if (!lightboxApi) return;
        lightboxApi.on("select", onLightboxSelect);
        return () => { lightboxApi.off("select", onLightboxSelect); };
    }, [lightboxApi, onLightboxSelect]);

    // Sync Lightbox when opening or when currentIndex changes externally
    useEffect(() => {
        if (isLightboxOpen && lightboxApi) {
            lightboxApi.scrollTo(currentIndex, true);
        }
    }, [isLightboxOpen, lightboxApi]);

    // Sync Main Carousel when currentIndex changes (e.g. from Lightbox)
    useEffect(() => {
        if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
            emblaApi.scrollTo(currentIndex);
        }
    }, [currentIndex, emblaApi]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const scrollPrevLightbox = useCallback(() => lightboxApi && lightboxApi.scrollPrev(), [lightboxApi]);
    const scrollNextLightbox = useCallback(() => lightboxApi && lightboxApi.scrollNext(), [lightboxApi]);

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                لا توجد صور متاحة
            </div>
        );
    }

    // Senior/UX: Ultra-fast 20KB thumbnail for initial blur
    // We provide a fallback to the original URL if transformation is disabled
    const getSafeBlurUrl = (src: string) => {
        const optimized = getOptimizedImageUrl(src, { width: 40, height: 40, quality: 10 });
        return optimized === src ? "" : optimized; // If same as src, don't use it as blurDataURL to avoid double-loading high-res
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main Slider Container */}
            <div className="group relative aspect-[4/3] w-full rounded-3xl bg-zinc-50 border border-zinc-100 shadow-sm md:aspect-video">
                {/* Viewport - Must have overflow-hidden for Embla */}
                <div className="h-full w-full overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing" ref={emblaRef}>
                    <div className="flex h-full">
                        {images.map((src, index) => {
                            const blurUrl = getSafeBlurUrl(src);
                            return (
                                <div key={index} className="relative h-full w-full flex-[0_0_100%] min-w-0">
                                    <Image
                                        src={getOptimizedImageUrl(src, { width: 800, height: 600, quality: 80 })}
                                        alt={`Product view ${index + 1}`}
                                        fill
                                        placeholder={blurUrl ? "blur" : "empty"}
                                        blurDataURL={blurUrl || undefined}
                                        priority={index === 0}
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
                    <div className="flex items-center justify-between p-4 z-50 bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0">
                        <span className="text-white text-xs font-black uppercase tracking-[0.3em]">معاينة التفاصيل</span>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="rounded-full bg-white/10 p-3 text-white backdrop-blur-xl hover:bg-white/20 transition-all active:scale-90"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="h-full w-full overflow-hidden" ref={lightboxRef}>
                        <div className="flex h-full touch-pan-y">
                            {images.map((src, index) => (
                                <div key={index} className="relative h-full w-full flex-[0_0_100%] min-w-0 flex items-center justify-center">
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={getOptimizedImageUrl(src, { width: 1200, height: 900, quality: 90 })}
                                            alt={`Full screen view ${index + 1}`}
                                            fill
                                            className="object-contain"
                                            priority={index === currentIndex}
                                            sizes="100vw"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={scrollPrevLightbox}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50"
                            >
                                <ChevronLeft className="h-10 w-10" />
                            </button>
                            <button
                                onClick={scrollNextLightbox}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50"
                            >
                                <ChevronRight className="h-10 w-10" />
                            </button>
                        </>
                    )}

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-50">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all shadow-sm",
                                    currentIndex === i ? "w-8 bg-orange-500" : "w-1.5 bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
