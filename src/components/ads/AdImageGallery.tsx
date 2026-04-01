"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import AutoPlay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/storageUtils";

interface AdImageGalleryProps {
    images: string[];
    hideMainGallery?: boolean;
    isForcedOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export function AdImageGallery({ 
    images, 
    hideMainGallery = false, 
    isForcedOpen = false, 
    onOpenChange 
}: AdImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [internalIsLightboxOpen, setInternalIsLightboxOpen] = useState(false);
    
    const isLightboxOpen = isForcedOpen || internalIsLightboxOpen;
    const setIsLightboxOpen = (open: boolean) => {
        setInternalIsLightboxOpen(open);
        onOpenChange?.(open);
    };
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { 
            loop: true, 
            skipSnaps: false, 
            align: "start",
            containScroll: "trimSnaps",
            dragFree: false,
            watchDrag: true
        },
        [AutoPlay({ delay: 5000, stopOnInteraction: false })]
    );
    const [lightboxRef, lightboxApi] = useEmblaCarousel({ 
        loop: true,
        skipSnaps: false,
        watchDrag: true
    });

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
                Aucune photo disponible
            </div>
        );
    }

    // Senior/UX: Ultra-fast 20KB thumbnail for initial blur
    // We provide a fallback to the original URL if transformation is disabled
    const getSafeBlurUrl = (src: string) => {
        const optimized = getOptimizedImageUrl(src, { width: 40, height: 40, quality: 10 });
        return optimized === src ? "" : optimized; // If same as src, don't use it as blurDataURL to avoid double-loading high-res
    };

    // Lightbox Modal
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (hideMainGallery) return (
        <>
            {isLightboxOpen && isMounted && createPortal(
                <div className="fixed inset-0 z-[999999] flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="flex items-center justify-between p-4 md:p-6 z-[1000001] bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0">
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-black uppercase tracking-[0.3em]">Galerie Photos</span>
                            <span className="text-zinc-400 text-[10px] font-bold mt-1">{currentIndex + 1} sur {images.length}</span>
                        </div>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="rounded-full bg-white/10 p-3 text-white backdrop-blur-xl hover:bg-white/20 transition-all active:scale-90 border border-white/10"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center p-0 md:p-12 overflow-hidden touch-pan-y" ref={lightboxRef}>
                        <div className="flex h-full w-full">
                            {images.map((src, index) => (
                                <div key={index} className="relative h-full w-full flex-[0_0_100%] min-w-0 flex items-center justify-center">
                                    <img
                                        src={getOptimizedImageUrl(src, { width: 1600, height: 1200, quality: 95 })}
                                        alt={`Full screen view ${index + 1}`}
                                        className="max-w-full max-h-screen md:max-h-[90vh] object-contain shadow-2xl pointer-events-auto"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollPrevLightbox(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[1000001] bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/5"
                            >
                                <ChevronLeft className="h-10 w-10" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollNextLightbox(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[1000001] bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/5"
                            >
                                <ChevronRight className="h-10 w-10" />
                            </button>
                        </>
                    )}

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-[1000001]">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => lightboxApi?.scrollTo(i)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all shadow-sm",
                                    currentIndex === i ? "w-8 bg-orange-500" : "w-2 bg-white/30 hover:bg-white/50"
                                )}
                                aria-label={`Aller à l'image ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Clean Modern Slider Layout */}
            <div className="group relative w-full rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden aspect-[4/3] md:aspect-[16/10] touch-pan-y">
                {/* Viewport */}
                <div className="h-full w-full cursor-grab active:cursor-grabbing overflow-hidden" ref={emblaRef}>
                    <div className="flex h-full">
                        {images.map((src, index) => (
                            <div key={index} className="relative h-full w-full flex-[0_0_100%] min-w-0 flex items-center justify-center">
                                <Image
                                    src={getOptimizedImageUrl(src, { width: 1200, height: 900, quality: 75 })}
                                    alt={`Product view ${index + 1}`}
                                    fill
                                    priority={index === 0}
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 70vw"
                                    onClick={() => setIsLightboxOpen(true)}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    unoptimized
                                    crossOrigin="anonymous"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-zinc-700 z-20"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-zinc-700 z-20"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Counter & Zoom Badge */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                    <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="pointer-events-auto w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-lg backdrop-blur-md border border-white/20"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </button>
                    <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            </div>

            {/* Premium Thumbnails Row */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide px-1">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi?.scrollTo(index)}
                            className={cn(
                                "relative aspect-square w-20 md:w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300",
                                currentIndex === index
                                    ? "border-orange-500 shadow-lg shadow-orange-500/20 scale-105"
                                    : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                            )}
                        >
                            <Image
                                src={getOptimizedImageUrl(image, { width: 150, height: 150 })}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-contain"
                                unoptimized
                                crossOrigin="anonymous"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {isLightboxOpen && isMounted && createPortal(
                <div className="fixed inset-0 z-[999999] flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="flex items-center justify-between p-4 md:p-6 z-[1000001] bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0">
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-black uppercase tracking-[0.3em]">Galerie Photos</span>
                            <span className="text-zinc-400 text-[10px] font-bold mt-1">{currentIndex + 1} sur {images.length}</span>
                        </div>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="rounded-full bg-white/10 p-3 text-white backdrop-blur-xl hover:bg-white/20 transition-all active:scale-90 border border-white/10"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center p-0 md:p-12 overflow-hidden touch-pan-y" ref={lightboxRef}>
                        <div className="flex h-full w-full">
                            {images.map((src, index) => (
                                <div key={index} className="relative h-full w-full flex-[0_0_100%] min-w-0 flex items-center justify-center">
                                    <img
                                        src={getOptimizedImageUrl(src, { width: 1600, height: 1200, quality: 95 })}
                                        alt={`Full screen view ${index + 1}`}
                                        className="max-w-full max-h-screen md:max-h-[90vh] object-contain shadow-2xl pointer-events-auto"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollPrevLightbox(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[1000001] bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/5"
                            >
                                <ChevronLeft className="h-10 w-10" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollNextLightbox(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[1000001] bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/5"
                            >
                                <ChevronRight className="h-10 w-10" />
                            </button>
                        </>
                    )}

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-[1000001]">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => lightboxApi?.scrollTo(i)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all shadow-sm",
                                    currentIndex === i ? "w-8 bg-orange-500" : "w-2 bg-white/30 hover:bg-white/50"
                                )}
                                aria-label={`Aller à l'image ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
