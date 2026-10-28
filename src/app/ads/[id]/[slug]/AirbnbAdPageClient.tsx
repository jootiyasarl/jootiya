"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Share2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  User,
  ArrowRight,
  Flag,
  Tag,
  Layers,
  Hash,
  X,
  ZoomIn,
  Star,
  Heart,
  Phone,
} from "lucide-react";
import { ContactActions } from "@/components/ads/ContactActions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { createPortal } from "react-dom";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface AirbnbAdPageClientProps {
  ad: any;
  images: string[];
  sellerName: string;
  sellerAvatar: string | null;
  memberSince: string | number;
  sellerPhone: string | undefined;
  formattedPrice: string;
  formattedDate: string;
  avgRating: number;
  totalReviews: number;
  isTrusted: boolean;
  user: any;
  similarAds?: any[];
}

// ─────────────────────────────────────────────────────────────────
// Utility: Share
// ─────────────────────────────────────────────────────────────────
async function shareAd(title: string) {
  const url = window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title, url }); } catch {}
  } else {
    await navigator.clipboard.writeText(url);
    toast.success("Lien copie dans le presse-papiers");
  }
}

// ─────────────────────────────────────────────────────────────────
// Utility: can next/image optimise this src?
// ─────────────────────────────────────────────────────────────────
function canOptimise(src: string) {
  return src.startsWith("/") || src.startsWith("http");
}

// ─────────────────────────────────────────────────────────────────
// Utility: format Moroccan phone for WhatsApp
// ─────────────────────────────────────────────────────────────────
function toWhatsAppNumber(raw: string) {
  const clean = raw.replace(/\D/g, "");
  return clean.startsWith("0") && clean.length === 10
    ? "212" + clean.substring(1)
    : clean;
}

// ─────────────────────────────────────────────────────────────────
// GALLERY — glassmorphic CTAs + hover arrows + counter + thumbnails
// ─────────────────────────────────────────────────────────────────
function PdpGallery({
  images,
  title,
  adId,
  adTitle,
  user,
  onShare,
}: {
  images: string[];
  title: string;
  adId: string;
  adTitle: string;
  user: any;
  onShare: () => void;
}) {
  const [current, setCurrent]       = useState(0);
  const [lightbox, setLightbox]     = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [isFav, setIsFav]           = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const touchX = useRef<number | null>(null);
  const FALLBACK = "/icon-512x512.png";
  const safe = images.length > 0 ? images : [FALLBACK];

  useEffect(() => { setMounted(true); }, []);

  // Favorite status
  useEffect(() => {
    if (!user) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("ad_id", adId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setIsFav(!!data));
  }, [user, adId]);

  const toggleFav = async () => {
    if (!user) { window.location.href = `/login?next=/ads/${adId}`; return; }
    setFavLoading(true);
    try {
      if (isFav) {
        await supabase.from("favorites").delete().eq("ad_id", adId).eq("user_id", user.id);
        setIsFav(false);
        toast.success("Retire des favoris");
      } else {
        await supabase.from("favorites").insert({ ad_id: adId, user_id: user.id });
        setIsFav(true);
        toast.success("Ajoute aux favoris");
      }
    } catch { toast.error("Une erreur s'est produite."); }
    finally { setFavLoading(false); }
  };

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent(c => (c === 0 ? safe.length - 1 : c - 1));
  }, [safe.length]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent(c => (c === safe.length - 1 ? 0 : c + 1));
  }, [safe.length]);

  // Keyboard for lightbox
  useEffect(() => {
    if (!lightbox) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox, prev, next]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const d = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(d) > 50) d > 0 ? prev() : next();
    touchX.current = null;
  };

  return (
    <>
      {/* ── Hero image ─────────────────────────────────────────
          aspect-[4/3] mobile → aspect-[16/10] desktop → zero CLS
      ──────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden bg-gray-100 group aspect-[4/3] sm:aspect-[16/10]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Current image */}
        {canOptimise(safe[current]) ? (
          <Image
            key={current}
            src={safe[current]}
            alt={`${title} – photo ${current + 1}`}
            fill
            priority={current === 0}
            sizes="(max-width: 1024px) 100vw, 67vw"
            className="object-cover select-none transition-opacity duration-200"
            draggable={false}
            onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FALLBACK) t.src = FALLBACK; }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={safe[current]} alt={`${title} – photo ${current + 1}`}
            className="absolute inset-0 h-full w-full object-cover select-none" loading="eager" draggable={false} />
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* ── Glassmorphic action buttons — top-right ── */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {/* Favorite */}
          <button
            onClick={toggleFav}
            disabled={favLoading}
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={cn(
              "h-9 w-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-90",
              isFav
                ? "bg-red-500/80 border-red-400/50 text-white"
                : "bg-white/20 border-white/30 text-white hover:bg-white/30"
            )}
          >
            <Heart className={cn("h-4 w-4 transition-all", isFav && "fill-current")} />
          </button>
          {/* Share */}
          <button
            onClick={onShare}
            aria-label="Partager"
            className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {/* Expand */}
          <button
            onClick={() => setLightbox(true)}
            aria-label="Agrandir"
            className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* ── Hover navigation arrows ── */}
        {safe.length > 1 && (
          <>
            <button
              aria-label="Photo precedente" onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Photo suivante" onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* ── Counter badge — bottom-left ── */}
        {safe.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 bg-black/55 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full tabular-nums">
            {current + 1} / {safe.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ─────────────────────────────────────
          Fixed h-16 w-16 (sm: 72×72) → zero CLS
      ──────────────────────────────────────────────────────── */}
      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 sm:px-0 py-3 bg-white">
          {safe.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Voir photo ${i + 1}`}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all",
                i === current ? "border-gray-900 shadow" : "border-transparent opacity-50 hover:opacity-75"
              )}
            >
              {canOptimise(src) ? (
                <Image src={src} alt={`Miniature ${i + 1}`} fill loading="lazy" sizes="72px"
                  className="object-cover"
                  onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FALLBACK) t.src = FALLBACK; }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`Miniature ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox Portal ── */}
      {lightbox && mounted && createPortal(
        <div
          role="dialog" aria-modal="true" aria-label="Galerie photos"
          className="fixed inset-0 z-[9999] flex flex-col bg-black/96 animate-in fade-in duration-200"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between px-4 py-4 shrink-0">
            <span className="text-white/70 text-sm font-semibold tabular-nums">
              {current + 1} sur {safe.length}
            </span>
            <button onClick={() => setLightbox(false)} aria-label="Fermer"
              className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current} src={safe[current]} alt={`${title} – ${current + 1}`}
              className="max-h-full max-w-full object-contain select-none" draggable={false}
              onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FALLBACK) t.src = FALLBACK; }}
            />
            {safe.length > 1 && (
              <>
                <button onClick={prev} aria-label="Photo precedente"
                  className="absolute left-2 sm:left-4 h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={next} aria-label="Photo suivante"
                  className="absolute right-2 sm:right-4 h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {safe.length > 1 && safe.length <= 12 && (
            <div className="flex justify-center gap-1.5 py-4 shrink-0">
              {safe.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} aria-label={`Photo ${i + 1}`}
                  className={cn("h-1.5 rounded-full transition-all", i === current ? "w-6 bg-white" : "w-1.5 bg-white/30")}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRODUCT HEADER — title + price badge + meta row
// ─────────────────────────────────────────────────────────────────
function ProductHeader({
  ad,
  formattedPrice,
  formattedDate,
}: {
  ad: any;
  formattedPrice: string;
  formattedDate: string;
}) {
  return (
    <div className="space-y-3">
      {/* Category / condition pills */}
      {(ad.is_featured || ad.condition || ad.category) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {ad.is_featured && (
            <span className="inline-flex items-center bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-amber-100">
              A la une
            </span>
          )}
          {ad.condition && (
            <span className="inline-flex items-center bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-sky-100">
              {ad.condition === "new" ? "Neuf" : "Occasion"}
            </span>
          )}
          {ad.category && (
            <span className="inline-flex items-center bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-sky-100">
              {ad.category}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h1 className="text-xl sm:text-2xl lg:text-[1.6rem] font-black text-gray-900 leading-snug tracking-tight">
        {ad.title}
      </h1>

      {/* Prominent price badge */}
      <div className="inline-flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-black text-amber-600 tabular-nums tracking-tight leading-none">
          {formattedPrice}
        </span>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          Negociable
        </span>
      </div>

      {/* Meta row: location · date · condition */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-gray-500">
        {ad.city && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {ad.city}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          {formattedDate}
        </span>
        {ad.condition && (
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {ad.condition === "new" ? "Neuf" : "Occasion"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DESCRIPTION BLOCK — amber bullet points per paragraph
// ─────────────────────────────────────────────────────────────────
function DescriptionBlock({ text }: { text: string | null }) {
  const raw = text?.trim() || "";

  // Split on double newlines for paragraphs, then on single newlines for lines
  const paragraphs = raw
    .split(/\n{2,}/)
    .flatMap(p =>
      p.split(/\n/).map(l => l.trim()).filter(Boolean)
    );

  if (paragraphs.length === 0) {
    return <p className="text-sm text-gray-400 italic">Aucune description fournie.</p>;
  }

  // Single block (no natural splits) → prose with amber left bar
  if (paragraphs.length === 1) {
    return (
      <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-amber-400 pl-3">
        {paragraphs[0]}
      </p>
    );
  }

  // Multi-line → bullet list with amber dots
  return (
    <ul className="space-y-2.5">
      {paragraphs.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
          <span className="text-sm text-gray-600 leading-relaxed">{line}</span>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────
// SAFETY BANNER — amber tint alert
// ─────────────────────────────────────────────────────────────────
function SafetyBanner() {
  const tips = [
    "Rencontrez le vendeur dans un lieu public et sur.",
    "Verifiez le produit avant tout paiement.",
    "Ne partagez jamais vos coordonnees bancaires.",
    "Privilegiez le paiement en especes de la main a la main.",
  ];
  return (
    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
        <h3 className="text-sm font-black text-amber-800 uppercase tracking-wide">
          Conseils de securite
        </h3>
      </div>
      <ul className="space-y-1.5">
        {tips.map(t => (
          <li key={t} className="flex items-start gap-2 text-xs text-amber-700">
            <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SELLER AVATAR
// ─────────────────────────────────────────────────────────────────
function SellerAvatar({
  avatar, name, size = "md",
}: {
  avatar: string | null; name: string; size?: "sm" | "md" | "lg";
}) {
  const FALLBACK = "/icon-512x512.png";
  const dims = { sm: "h-10 w-10 rounded-xl", md: "h-12 w-12 rounded-2xl", lg: "h-14 w-14 rounded-2xl" };
  const px   = { sm: 40, md: 48, lg: 56 };
  return (
    <div className={cn("relative overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-gray-400", dims[size])}>
      {avatar && canOptimise(avatar) ? (
        <Image src={avatar} alt={name} fill loading="lazy" sizes={`${px[size]}px`} className="object-cover"
          onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FALLBACK) t.src = FALLBACK; }}
        />
      ) : avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <User className="h-5 w-5" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DETAIL ROW — label + value pair
// ─────────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5 text-gray-400">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// RELATED AD CARD — square image
// ─────────────────────────────────────────────────────────────────
function RelatedAdCard({ ad }: { ad: any }) {
  const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const FALLBACK = "/icon-512x512.png";
  const raw = ad.image_urls?.[0];
  const src = raw?.startsWith("http")
    ? raw
    : raw
    ? `${SUPABASE}/storage/v1/object/public/ad-images/${raw.startsWith("/") ? raw.slice(1) : raw}`
    : FALLBACK;

  const slug  = ad.slug || ad.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const price = ad.price
    ? `${Number(ad.price).toLocaleString("fr-FR")} ${ad.currency || "MAD"}`
    : "Sur demande";

  return (
    <Link href={`/ads/${ad.id}/${slug}`} className="group block">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200">
        {/* Square image container — aspect-square → zero CLS */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          {canOptimise(src) ? (
            <Image src={src} alt={ad.title} fill loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
              onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FALLBACK) t.src = FALLBACK; }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={ad.title}
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
              loading="lazy" />
          )}
        </div>
        <div className="p-3">
          <p className="text-amber-600 font-black text-sm tabular-nums">{price}</p>
          <h3 className="text-gray-800 font-semibold text-[13px] line-clamp-2 mt-0.5 leading-snug">{ad.title}</h3>
          {ad.city && (
            <p className="text-gray-400 text-[11px] mt-1.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />{ad.city}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
// MOBILE STICKY CONVERSION BAR
// Shows price + WhatsApp + Call — replaces generic footer
// ─────────────────────────────────────────────────────────────────
function MobileStickyBar({
  phone,
  adTitle,
  formattedPrice,
}: {
  phone: string;
  adTitle: string;
  formattedPrice: string;
}) {
  const clean = phone?.replace(/\D/g, "") || "";
  const wa    = clean ? toWhatsAppNumber(clean) : "";
  const waMsg = `Bonjour, je suis interesse par votre annonce "${adTitle}" a ${formattedPrice}. Est-elle toujours disponible ?`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
      <div className="max-w-xl mx-auto flex items-center gap-2.5">

        {/* Price label */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Prix</p>
          <p className="text-lg font-black text-amber-600 tabular-nums truncate leading-tight">{formattedPrice}</p>
        </div>

        {/* Call */}
        {clean && (
          <a
            href={`tel:${phone}`}
            aria-label="Appeler le vendeur"
            className="h-12 w-12 rounded-2xl bg-gray-900 hover:bg-gray-800 active:scale-[0.96] text-white flex items-center justify-center shrink-0 transition-all shadow-sm"
          >
            <Phone className="h-5 w-5" />
          </a>
        )}

        {/* WhatsApp */}
        {wa && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contacter via WhatsApp"
            className="h-12 flex-1 max-w-[180px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.96] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </a>
        )}

        {/* Fallback when no phone at all */}
        {!clean && !wa && (
          <button
            onClick={() => toast.error("Numero de telephone non disponible.")}
            className="h-12 flex-1 rounded-2xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Phone className="h-4 w-4" />
            Contacter
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE CLIENT COMPONENT
// ─────────────────────────────────────────────────────────────────
export function AirbnbAdPageClient({
  ad,
  images,
  sellerName,
  sellerAvatar,
  memberSince,
  sellerPhone,
  formattedPrice,
  formattedDate,
  avgRating,
  totalReviews,
  isTrusted,
  user,
  similarAds = [],
}: AirbnbAdPageClientProps) {
  const safeImages = images.length > 0 ? images : ["/icon-512x512.png"];

  const detailRows = [
    ad.category && { icon: Tag,    label: "Categorie", value: ad.category },
    ad.condition && { icon: Layers, label: "Etat",      value: ad.condition === "new" ? "Neuf" : "Occasion" },
    ad.city      && { icon: MapPin, label: "Ville",     value: ad.city },
    ad.id        && { icon: Hash,   label: "Reference", value: ad.id.slice(0, 8).toUpperCase() },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <div className="bg-gray-50 min-h-screen pb-28 lg:pb-10 font-sans antialiased overflow-x-hidden">

      {/* ══════════════════════════════════════════
          BREADCRUMB BAR
      ══════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center">
          <nav aria-label="Fil d'Ariane"
            className="flex items-center gap-1 text-xs font-medium text-gray-400 min-w-0 overflow-hidden flex-1">
            <Link href="/" className="hover:text-gray-700 transition-colors whitespace-nowrap shrink-0">Accueil</Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
            <Link href="/marketplace" className="hover:text-gray-700 transition-colors whitespace-nowrap shrink-0">Annonces</Link>
            {ad.category && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
                <Link
                  href={`/marketplace/category/${ad.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="hover:text-gray-700 transition-colors whitespace-nowrap shrink-0"
                >
                  {ad.category}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
            <span className="truncate text-gray-700 font-semibold">{ad.title}</span>
          </nav>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-0 sm:px-6 pt-0 sm:pt-5">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">

          {/* ╔══════════════════════════════════════
              LEFT — 8 cols
          ══════════════════════════════════════╝ */}
          <main className="lg:col-span-8 space-y-3 order-2 lg:order-1">

            {/* GALLERY */}
            <div className="bg-white border border-gray-100 overflow-hidden sm:rounded-2xl">
              <PdpGallery
                images={safeImages}
                title={ad.title}
                adId={ad.id}
                adTitle={ad.title}
                user={user}
                onShare={() => shareAd(ad.title)}
              />
            </div>

            {/* PRODUCT HEADER */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
              <ProductHeader ad={ad} formattedPrice={formattedPrice} formattedDate={formattedDate} />
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
              <h2 className="text-base font-black text-gray-900 mb-4">Description</h2>
              <DescriptionBlock text={ad.description} />
            </div>

            {/* DETAILS */}
            {detailRows.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
                <h2 className="text-base font-black text-gray-900 mb-1">
                  Details de l&apos;annonce
                </h2>
                {detailRows.map(r => <DetailRow key={r.label} icon={r.icon} label={r.label} value={r.value} />)}
              </div>
            )}

            {/* SAFETY BANNER */}
            <SafetyBanner />

            {/* SELLER — mobile only */}
            <div className="lg:hidden bg-white border border-gray-100 rounded-2xl px-5 py-5">
              <h2 className="text-base font-black text-gray-900 mb-4">Vendeur</h2>
              <div className="flex items-center gap-3">
                <SellerAvatar avatar={sellerAvatar} name={sellerName} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-gray-900 text-sm truncate">{sellerName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />Membre depuis {memberSince}
                  </p>
                  {totalReviews > 0 && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {avgRating.toFixed(1)}
                      <span className="text-gray-400">({totalReviews} avis)</span>
                    </p>
                  )}
                </div>
                {isTrusted && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border border-emerald-100 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />Verifie
                  </span>
                )}
              </div>
            </div>

            {/* CONTACT — mobile only */}
            <div className="lg:hidden bg-white border border-gray-100 rounded-2xl px-5 py-5">
              <ContactActions
                adId={ad.id}
                sellerId={ad.seller_id}
                currentUser={user}
                sellerPhone={sellerPhone}
              />
            </div>

            {/* REPORT */}
            <div className="flex justify-start pb-1 px-1">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
                <Flag className="h-3.5 w-3.5" />Signaler cette annonce
              </button>
            </div>
          </main>

          {/* ╔══════════════════════════════════════
              RIGHT — sticky sidebar, 4 cols (desktop only)
          ══════════════════════════════════════╝ */}
          <aside className="lg:col-span-4 order-1 lg:order-2 hidden lg:block">
            <div className="sticky top-[72px] space-y-3">

              {/* PRICE + SELLER + CTA */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

                {/* Price */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Prix</p>
                  <p className="text-[2.4rem] font-black text-amber-600 tabular-nums leading-none tracking-tight">
                    {formattedPrice}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1.5">Negociable directement avec le vendeur</p>
                </div>

                {/* Seller profile */}
                <div className="px-5 py-4 border-b border-gray-50">
                  <div className="flex items-start gap-3">
                    <SellerAvatar avatar={sellerAvatar} name={sellerName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">{sellerName}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />Membre depuis {memberSince}
                      </p>
                      {totalReviews > 0 && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-0.5 mt-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {avgRating.toFixed(1)}
                          <span className="text-gray-400 ml-0.5">({totalReviews})</span>
                        </p>
                      )}
                    </div>
                    {isTrusted && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border border-emerald-100 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />Verifie
                      </span>
                    )}
                  </div>

                  {/* Verified banner */}
                  {isTrusted && (
                    <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-bold text-emerald-700">
                        Vendeur verifie par Jootiya
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="px-5 py-4">
                  <ContactActions
                    adId={ad.id}
                    sellerId={ad.seller_id}
                    currentUser={user}
                    sellerPhone={sellerPhone}
                  />
                  <p className="text-center text-[10px] text-gray-400 mt-3">
                    Aucun frais ne vous sera preleve
                  </p>
                </div>
              </div>

              {/* SHARE */}
              <button
                onClick={() => shareAd(ad.title)}
                className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center justify-between hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <Share2 className="h-4 w-4 text-gray-500" />
                  </span>
                  <span className="text-sm font-bold text-gray-700">Partager cette annonce</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* QUICK DETAILS */}
              {detailRows.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Informations
                  </h3>
                  {detailRows.map(r => <DetailRow key={r.label} icon={r.icon} label={r.label} value={r.value} />)}
                </div>
              )}

              {/* SAFETY TIPS — compact sidebar version */}
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <p className="text-[11px] font-bold text-amber-700">
                    Verifiez toujours le produit avant paiement.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ══════════════════════════════════════════
            RELATED ADS — "Ces annonces peuvent vous interesser"
        ══════════════════════════════════════════ */}
        {similarAds.length > 0 && (
          <section className="mt-8 pb-4 px-4 sm:px-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-gray-900">
                Ces annonces peuvent vous interesser
              </h2>
              {ad.category && (
                <Link
                  href={`/marketplace/category/${ad.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Voir tout <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            {/* 2 cols mobile → 4 cols desktop, square cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {similarAds.map(a => <RelatedAdCard key={a.id} ad={a} />)}
            </div>
          </section>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MOBILE STICKY CONVERSION BAR
      ══════════════════════════════════════════ */}
      <MobileStickyBar
        phone={sellerPhone || ""}
        adTitle={ad.title}
        formattedPrice={formattedPrice}
      />
    </div>
  );
}
