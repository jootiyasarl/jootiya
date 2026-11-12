"use client";

/**
 * PdpGallery — Ad detail photo gallery (hero + thumbnails).
 * Code-split via next/dynamic in AirbnbAdPageClient: SSRs into HTML
 * for SEO/LCP while its JS loads as a separate chunk.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Share2, ChevronRight, ChevronLeft, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// Lightbox is portal-heavy — load it only when the user opens it
const PdpLightbox = dynamic(
  () => import("@/components/ads/PdpLightbox").then((m) => m.PdpLightbox),
  { ssr: false }
);

function canOptimise(src: string) {
  return src.startsWith("/") || src.startsWith("http");
}

const FB = "/icon-512x512.png";

export function PdpGallery({
  images, title, adId, user, onShare,
}: {
  images: string[]; title: string; adId: string; user: any; onShare: () => void;
}) {
  const [cur, setCur]           = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [isFav, setIsFav]       = useState(false);
  const [favLoad, setFavLoad]   = useState(false);
  const touchX = useRef<number | null>(null);
  const safe = images.length > 0 ? images : [FB];

  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("id")
      .eq("ad_id", adId).eq("user_id", user.id).single()
      .then(({ data }) => setIsFav(!!data));
  }, [user, adId]);

  const toggleFav = async () => {
    if (!user) { window.location.href = `/login?next=/ads/${adId}`; return; }
    setFavLoad(true);
    try {
      if (isFav) {
        await supabase.from("favorites").delete().eq("ad_id", adId).eq("user_id", user.id);
        setIsFav(false); toast.success("Retiré des favoris");
      } else {
        await supabase.from("favorites").insert({ ad_id: adId, user_id: user.id });
        setIsFav(true); toast.success("Ajouté aux favoris");
      }
    } catch { toast.error("Erreur"); } finally { setFavLoad(false); }
  };

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation(); setCur(c => c === 0 ? safe.length - 1 : c - 1);
  }, [safe.length]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation(); setCur(c => c === safe.length - 1 ? 0 : c + 1);
  }, [safe.length]);

  const onTS = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTE = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const d = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(d) > 50) d > 0 ? prev() : next();
    touchX.current = null;
  };

  return (
    <>
      {/* ── Hero image — 4:3 aspect, zoom cursor ── */}
      <div
        className="relative w-full bg-gray-100 overflow-hidden group aspect-[4/3] cursor-zoom-in rounded-xl"
        onTouchStart={onTS} onTouchEnd={onTE}
        onClick={() => setLightbox(true)}
      >
        {canOptimise(safe[cur]) ? (
          <Image
            key={cur}
            src={safe[cur]}
            alt={`${title} – photo ${cur + 1}`}
            fill
            priority={cur === 0}
            sizes="(max-width:1024px) 100vw, 60vw"
            className="object-cover select-none group-hover:scale-[1.02] transition-transform duration-500"
            draggable={false}
            onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FB) t.src = FB; }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={safe[cur]} alt={`${title} – photo ${cur + 1}`}
            className="absolute inset-0 h-full w-full object-cover select-none group-hover:scale-[1.02] transition-transform duration-500"
            loading="eager" draggable={false} />
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Top-right action buttons */}
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            aria-label="Partager"
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFav(); }}
            disabled={favLoad}
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={cn(
              "h-9 w-9 rounded-full backdrop-blur-sm shadow-sm flex items-center justify-center transition-all hover:scale-110",
              isFav
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
          </button>
        </div>

        {/* Navigation arrows — appear on hover */}
        {safe.length > 1 && (<>
          <button
            aria-label="Photo précédente"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Photo suivante"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>)}

        {/* Photo counter pill */}
        {safe.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full tabular-nums cursor-default select-none"
          >
            {cur + 1} / {safe.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-2 mt-2">
          {safe.map((src, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              aria-label={`Afficher la photo ${i + 1}`}
              className={cn(
                "relative flex-shrink-0 w-[72px] h-[54px] rounded-lg overflow-hidden border-2 transition-all",
                i === cur
                  ? "border-gray-900 shadow-sm scale-[1.04]"
                  : "border-gray-200 opacity-55 hover:opacity-85 hover:border-gray-400"
              )}
            >
              {canOptimise(src) ? (
                <Image src={src} alt={`Miniature ${i + 1}`} fill loading="lazy" sizes="72px" className="object-cover"
                  onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FB) t.src = FB; }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`Miniature ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox (lazy-loaded chunk) ── */}
      {lightbox && (
        <PdpLightbox
          images={safe}
          title={title}
          initialIndex={cur}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}
