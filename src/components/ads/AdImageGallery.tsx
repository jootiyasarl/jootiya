"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/storageUtils";

interface AdImageGalleryProps {
    images: string[];
}

export function AdImageGallery({ images }: AdImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                لا توجد صور متاحة
            </div>
        );
    }

    const nextImage = () => {
        setIsLoaded(false);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setIsLoaded(false);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Senior/UX: Ultra-fast 20KB thumbnail for initial blur
    const currentImageUrl = images[currentIndex];
    const blurUrl = getOptimizedImageUrl(currentImageUrl, { width: 40, height: 40, quality: 10 });

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image Container */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-zinc-100 sm:aspect-video">
                <Image
                    src={currentImageUrl}
                    alt={`Ad image ${currentIndex + 1}`}
                    fill
                    placeholder="blur"
                    blurDataURL={blurUrl}
                    onLoadingComplete={() => setIsLoaded(true)}
                    className={cn(
                        "object-contain duration-700 ease-in-out cursor-pointer transition-all",
                        isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-30 scale-105 blur-lg"
                    )}
                    priority
                    onClick={() => setIsLightboxOpen(true)}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-800 shadow-md backdrop-blur-md transition-all hover:bg-white active:scale-95 disabled:opacity-50"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-800 shadow-md backdrop-blur-md transition-all hover:bg-white active:scale-95 disabled:opacity-50"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Counter Overlay */}
                <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md pointer-events-none">
                    {currentIndex + 1} / {images.length}
                </div>

                {/* Expand Button */}
                <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute right-4 bottom-4 rounded-full bg-white/80 p-2 text-zinc-800 shadow-md backdrop-blur-md transition-all hover:bg-white active:scale-95 z-10"
                >
                    <Maximize2 className="h-5 w-5" />
                </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                                currentIndex === index
                                    ? "border-orange-600 ring-2 ring-orange-600/20"
                                    : "border-transparent hover:border-zinc-300"
                            )}
                        >
                            <Image
                                src={image}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute right-6 top-6 z-50 rounded-full bg-zinc-800/50 p-3 text-white backdrop-blur-md hover:bg-zinc-700 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="relative h-full w-full max-w-7xl p-4 flex items-center justify-center">
                        <Image
                            src={images[currentIndex]}
                            alt={`Full screen image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            quality={100}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800/50 p-4 text-white backdrop-blur-md hover:bg-zinc-700 transition-all hover:scale-105"
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800/50 p-4 text-white backdrop-blur-md hover:bg-zinc-700 transition-all hover:scale-105"
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
