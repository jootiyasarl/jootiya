"use client";

/**
 * PdpLightbox — full-screen photo viewer for the ad detail gallery.
 * Loaded lazily via next/dynamic({ ssr: false }) — this chunk is only
 * fetched when the user actually opens the lightbox.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FB = "/icon-512x512.png";

export function PdpLightbox({
  images, title, initialIndex, onClose,
}: {
  images: string[]; title: string; initialIndex: number; onClose: () => void;
}) {
  const [cur, setCur] = useState(initialIndex);
  const safe = images.length > 0 ? images : [FB];

  const prev = useCallback(() => {
    setCur(c => (c === 0 ? safe.length - 1 : c - 1));
  }, [safe.length]);

  const next = useCallback(() => {
    setCur(c => (c === safe.length - 1 ? 0 : c + 1));
  }, [safe.length]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const touchX = useRef<number | null>(null);
  const onTS = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTE = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const d = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(d) > 50) d > 0 ? prev() : next();
    touchX.current = null;
  };

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label="Galerie photos"
      className="fixed inset-0 z-[9999] flex flex-col bg-black/97 animate-in fade-in duration-150"
      onClick={onClose}
      onTouchStart={onTS} onTouchEnd={onTE}
    >
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm font-medium tabular-nums">{cur + 1} / {safe.length}</span>
        <button onClick={onClose} aria-label="Fermer la galerie"
          className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/25 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={cur} src={safe[cur]} alt={`${title} – ${cur + 1}`}
          className="max-h-full max-w-full object-contain select-none rounded-lg shadow-2xl"
          draggable={false}
          onClick={e => e.stopPropagation()}
          onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FB) t.src = FB; }} />
        {safe.length > 1 && (<>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Précédent"
            className="absolute left-2 sm:left-6 h-11 w-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Suivant"
            className="absolute right-2 sm:right-6 h-11 w-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>)}
      </div>
      <div className="shrink-0 flex flex-col items-center gap-2 py-4" onClick={e => e.stopPropagation()}>
        {safe.length > 1 && safe.length <= 12 && (
          <div className="flex justify-center gap-1.5">
            {safe.map((_, i) => (
              <button key={i} onClick={() => setCur(i)} aria-label={`Photo ${i + 1}`}
                className={cn("h-1.5 rounded-full transition-all", i === cur ? "w-6 bg-white" : "w-1.5 bg-white/30")} />
            ))}
          </div>
        )}
        <p className="text-white/30 text-[11px]">Appuyer en dehors pour fermer</p>
      </div>
    </div>,
    document.body
  );
}
