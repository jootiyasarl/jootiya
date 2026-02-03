"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface AdImageGalleryProps {
    images: string[];
}

export function AdImageGallery({ images }: AdImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                لا توجد صور متاحة
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image Container */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-zinc-100 sm:aspect-video">
                <Image
                    src={images[currentIndex]}
                    alt={`Ad image ${currentIndex + 1}`}
                    fill
                    className="object-contain duration-500 ease-in-out"
                    priority
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-800 shadow-md backdrop-blur-md transition-all hover:bg-white active:scale-95 disabled:opacity-50"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-800 shadow-md backdrop-blur-md transition-all hover:bg-white active:scale-95 disabled:opacity-50"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Counter Overlay */}
                <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {currentIndex + 1} / {images.length}
                </div>

                {/* Expand Button (Visual only) */}
                <button className="absolute right-4 bottom-4 rounded-full bg-white/80 p-2 text-zinc-800 shadow-md backdrop-blur-md transition-all hover:bg-white active:scale-95">
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
                                    ? "border-blue-600 ring-2 ring-blue-600/20"
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
        </div>
    );
}
