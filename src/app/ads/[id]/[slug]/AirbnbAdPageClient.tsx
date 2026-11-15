"use client";

/**
 * AirbnbAdPageClient — Ad Details Page (jootiya.com)
 *
 * LAYOUT (desktop):
 *  LEFT  col-span-8  → Gallery · Price · Description · Specs chips · Social share · Map · Similar
 *  RIGHT col-span-4  → Seller card (sticky) · AdSense
 *
 * IMPROVEMENTS (v2):
 *  - Full-bleed gallery with no card wrapper (image-first)
 *  - Floating price ribbon with gradient background
 *  - Spec chips instead of plain key/value list
 *  - Seller card with gradient header + prominent CTAs
 *  - Refined breadcrumb bar
 *  - Mobile sticky bar preserved
 */

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const AdMap = dynamic(() => import("@/components/ads/AdMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <MapPin className="h-6 w-6 text-gray-300 animate-bounce" />
    </div>
  ),
});

const PdpGallery = dynamic(() =>
  import("@/components/ads/PdpGallery").then((m) => m.PdpGallery)
);

import { AdSenseSidebar } from "@/components/ads/AdSenseSidebar";
import {
  MapPin, Calendar, Tag, Eye, Flag, Share2,
  ChevronRight, ChevronLeft, Phone, MessageCircle,
  Send, Loader2, User, CheckCircle2, Mail, Shield,
  Gauge, Car, Layers, Wrench, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sendMessageAction } from "@/app/messages/actions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
async function shareAd(title: string) {
  const url = window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title, url }); } catch {}
  } else {
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papiers");
  }
}

function canOptimise(src: string) {
  return src.startsWith("/") || src.startsWith("http");
}

function toWaNumber(raw: string) {
  const c = raw.replace(/\D/g, "");
  return c.startsWith("0") && c.length === 10 ? "212" + c.slice(1) : c;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return "";
  }
}

function maskPhone(raw?: string) {
  const c = raw?.replace(/\D/g, "") || "";
  if (c.length < 6) return "06 XX XX XX XX";
  return `${c.slice(0, 4)} XX XX XX`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Social share icons (inline SVG — Lucide has no brand icons)
// ─────────────────────────────────────────────────────────────────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spec chip — icon + label + value pill
// ─────────────────────────────────────────────────────────────────────────────
function SpecChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 min-w-0">
      <span className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="h-3.5 w-3.5 text-orange-500" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">
          {label}
        </p>
        <p className="text-[12px] font-bold text-gray-800 truncate leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// Map field name → Lucide icon
function specIcon(label: string): React.ElementType {
  const l = label.toLowerCase();
  if (l.includes("catég")) return Tag;
  if (l.includes("état") || l.includes("condition")) return Shield;
  if (l.includes("marque")) return Layers;
  if (l.includes("modèle")) return Car;
  if (l.includes("année")) return Calendar;
  if (l.includes("kilo")) return Gauge;
  if (l.includes("ville")) return MapPin;
  return Wrench;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD A — Main ad content
// ─────────────────────────────────────────────────────────────────────────────
function MainAdCard({
  ad, images, formattedPrice, formattedDate, user,
}: {
  ad: any; images: string[]; formattedPrice: string; formattedDate: string; user: any;
}) {
  const safeImages = images.length > 0 ? images : ["/icon-512x512.png"];
  const views = ad.views ?? ad.view_count;
  const isSold = ad.status === "sold";

  const specs: { label: string; value: string }[] = [
    ad.category  && { label: "Catégorie",   value: ad.category },
    ad.condition && { label: "État",         value: ad.condition === "new" ? "Neuf" : "Occasion" },
    ad.brand     && { label: "Marque",       value: ad.brand },
    ad.model     && { label: "Modèle",       value: ad.model },
    ad.year      && { label: "Année",        value: String(ad.year) },
    ad.mileage   && { label: "Kilométrage",  value: `${Number(ad.mileage).toLocaleString("fr-FR")} km` },
    ad.city      && { label: "Ville",        value: ad.city },
  ].filter(Boolean) as { label: string; value: string }[];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const socials = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      Icon: FacebookIcon,
      color: "hover:bg-blue-600 hover:border-blue-600",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(ad.title)}`,
      Icon: XIcon,
      color: "hover:bg-gray-900 hover:border-gray-900",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      Icon: LinkedInIcon,
      color: "hover:bg-blue-700 hover:border-blue-700",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${ad.title} - ${formattedPrice} ${shareUrl}`)}`,
      Icon: WhatsAppIcon,
      color: "hover:bg-emerald-600 hover:border-emerald-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Gallery ── */}
      <div className="relative">
        <PdpGallery
          images={safeImages}
          title={ad.title}
          adId={ad.id}
          user={user}
          onShare={() => shareAd(ad.title)}
        />

        {/* Status badge */}
        {(isSold || ad.is_featured) && (
          <div
            className={cn(
              "absolute top-3 left-3 z-20 pointer-events-none",
              "px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white rounded-full shadow-lg backdrop-blur-sm",
              isSold ? "bg-red-500/90" : "bg-orange-500/90"
            )}
          >
            {isSold ? "Vendu" : "Top"}
          </div>
        )}
      </div>

      {/* ── Meta bar (date · location · category · views) ── */}
      <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-gray-100">
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <Calendar className="h-3.5 w-3.5" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <MapPin className="h-3.5 w-3.5" />
          {ad.city ? `${ad.city}, Maroc` : "Maroc"}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <Tag className="h-3.5 w-3.5" />
          {ad.category || "À vendre"}
        </span>
        {typeof views === "number" && views > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium ml-auto">
            <Eye className="h-3.5 w-3.5" />
            {views.toLocaleString("fr-FR")} vues
          </span>
        )}
      </div>

      {/* ── Title ── */}
      <div className="px-5 pt-4">
        <h1 className="text-xl font-black text-gray-900 leading-tight">{ad.title}</h1>
      </div>

      {/* ── Price card ── */}
      <div className="mx-5 mt-3 mb-4 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-white border border-orange-100 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">Prix</p>
          <p className="text-2xl font-black text-[#f97316] tabular-nums leading-none">{formattedPrice}</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-100 px-2.5 py-1 rounded-full">
          Négociable
        </span>
      </div>

      {/* ── Description ── */}
      <div className="px-5 pb-5">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
          Description
        </h2>
        <DescriptionBlock text={ad.description} />
      </div>

      {/* ── Specs chips grid ── */}
      {specs.length > 0 && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            Caractéristiques
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {specs.map((s) => (
              <SpecChip
                key={s.label}
                label={s.label}
                value={s.value}
                icon={specIcon(s.label)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Share + Report ── */}
      <div className="px-5 pb-5 border-t border-gray-100 pt-4 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
          <Share2 className="h-3.5 w-3.5 text-gray-400" />
          Partager
        </span>
        {socials.map(({ label, href, Icon, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Partager sur ${label}`}
            className={cn(
              "h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center",
              "text-gray-400 hover:text-white transition-all duration-200",
              color
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        ))}
        <button
          className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
          <Flag className="h-3.5 w-3.5" />
          Signaler
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Description — collapsible
// ─────────────────────────────────────────────────────────────────────────────
function DescriptionBlock({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const raw = text?.trim() || "";
  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return <p className="text-sm text-gray-400 italic">Aucune description fournie.</p>;
  }

  const LIMIT = 6;
  const visible = expanded ? lines : lines.slice(0, LIMIT);
  const hasMore = lines.length > LIMIT;

  return (
    <div>
      <div className="space-y-2">
        {visible.map((l, i) => (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {l}
          </p>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD B — Location
// ─────────────────────────────────────────────────────────────────────────────
function LocationCard({ ad }: { ad: any }) {
  const hasCoords = typeof ad.latitude === "number" && typeof ad.longitude === "number";
  const fullLocation = [ad.neighborhood, ad.city].filter(Boolean).join(", ");

  if (!ad.city && !ad.neighborhood && !hasCoords) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-orange-500" />
        </div>
        <h2 className="text-base font-black text-gray-900">Localisation</h2>
        {fullLocation && (
          <span className="ml-auto text-sm font-semibold text-gray-500">{fullLocation}</span>
        )}
      </div>
      <div className="p-4">
        {hasCoords ? (
          <>
            <div className="rounded-xl overflow-hidden">
              <AdMap
                lat={ad.latitude}
                lng={ad.longitude}
                title={ad.title}
                city={fullLocation}
                heightClass="h-[220px]"
              />
            </div>
            <a
              href={`https://maps.openstreetmap.org/?mlat=${ad.latitude}&mlon=${ad.longitude}&zoom=15`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-orange-500 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              Ouvrir dans OpenStreetMap
            </a>
          </>
        ) : (
          <div className="relative h-[180px] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400">
            <MapPin className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">{fullLocation || "Maroc"}</p>
            <p className="text-xs text-gray-400">Coordonnées non disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD C — Similar ads carousel
// ─────────────────────────────────────────────────────────────────────────────
function SimilarAdsCard({ ads }: { ads: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  if (!ads.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-black text-gray-900">Annonces similaires</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Annonces précédentes"
            className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Annonces suivantes"
            className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-5 py-4"
      >
        {ads.map((sim) => (
          <div key={sim.id} className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[30%]">
            <RelatedAdCard ad={sim} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedAdCard({ ad }: { ad: any }) {
  const FB = "/icon-512x512.png";
  const raw = ad.image_urls?.[0];
  const src =
    raw?.startsWith("http")
      ? raw
      : raw
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-images/${
          raw.startsWith("/") ? raw.slice(1) : raw
        }`
      : FB;
  const slug = ad.slug || ad.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const price = ad.price
    ? `${Number(ad.price).toLocaleString("fr-FR")} ${ad.currency || "MAD"}`
    : "Sur demande";
  const ago = timeAgo(ad.created_at);

  return (
    <Link href={`/ads/${ad.id}/${slug}`} className="group block h-full">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-md hover:border-orange-200 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {canOptimise(src) ? (
            <Image
              src={src}
              alt={ad.title}
              fill
              sizes="(max-width:768px) 78vw, 30vw"
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                if (t.src !== FB) t.src = FB;
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={ad.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          )}
          {ad.status === "sold" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-red-500 px-2.5 py-1 rounded-full">
                Vendu
              </span>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            {ad.category || "Annonce"}
          </p>
          <h3 className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 mt-0.5">
            {ad.title}
          </h3>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-gray-400">
            {ago && <p>{ago}</p>}
            {ad.city && (
              <p className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                {ad.city}
              </p>
            )}
          </div>
          <p className="mt-auto pt-2 text-[15px] font-black text-[#f97316] tabular-nums">
            {price}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT COLUMN — Seller card (redesigned)
// ─────────────────────────────────────────────────────────────────────────────
function SellerInfoCard({
  ad, sellerName, sellerAvatar, memberSince,
  avgRating, totalReviews, isTrusted, sellerPhone,
}: {
  ad: any; sellerName: string; sellerAvatar: string | null;
  memberSince: string | number; avgRating: number; totalReviews: number;
  isTrusted: boolean; sellerPhone?: string;
}) {
  const router = useRouter();
  const [msgOpen, setMsgOpen]     = useState(false);
  const [message, setMessage]     = useState("");
  const [sending, setSending]     = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const clean = sellerPhone?.replace(/\D/g, "") || "";
  const phoneVerified = clean.length >= 9;
  const wa = phoneVerified ? toWaNumber(sellerPhone!) : "";
  const waMsg = `Bonjour, je suis intéressé par votre annonce "${ad.title}" sur Jootiya.`;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const r = await sendMessageAction({
        adId: ad.id,
        sellerId: ad.seller_id,
        content: message.trim(),
      });
      if (r.error) {
        if (r.error.includes("connecter")) router.push(`/login?next=/ads/${ad.id}`);
        else toast.error(r.error);
        return;
      }
      setMsgOpen(false);
      setMessage("");
      toast.success("Message envoyé !");
      router.push(`/dashboard/messages?id=${r.conversationId}`);
    } catch {
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Gradient header */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white px-5 pt-5 pb-4 border-b border-orange-100">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md shrink-0 flex items-center justify-center text-gray-400">
            {sellerAvatar && canOptimise(sellerAvatar) ? (
              <Image src={sellerAvatar} alt={sellerName} fill sizes="56px" className="object-cover" />
            ) : sellerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sellerAvatar} alt={sellerName} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-gray-400" />
            )}
          </div>

          {/* Name + status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-black text-gray-900 text-[15px] truncate">{sellerName}</p>
              {isTrusted && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-label="Vendeur vérifié" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-gray-500 font-medium">En ligne</span>
              <span className="text-gray-300">·</span>
              <span className="text-[11px] text-gray-400">Membre depuis {memberSince}</span>
            </div>
            {totalReviews > 0 && (
              <p className="text-[11px] text-amber-500 font-bold mt-0.5">
                {avgRating.toFixed(1)} / 5 ({totalReviews} avis)
              </p>
            )}
          </div>
        </div>

        {/* Verified badge */}
        {isTrusted && (
          <div className="mt-3 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-600">Vendeur vérifié Jootiya</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">

        {/* Location + profile link */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            {ad.city ? `${ad.city}, Maroc` : "Maroc"}
          </span>
          <Link
            href={`/seller/${ad.seller_id}`}
            className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-bold text-xs"
          >
            Voir la boutique
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Click-to-reveal phone */}
        {phoneVerified && (
          <button
            type="button"
            onClick={() => setShowPhone((v) => !v)}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 transition-colors text-left"
          >
            <span className="h-9 w-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-gray-600" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-gray-800 tabular-nums">
                {showPhone ? sellerPhone : maskPhone(sellerPhone)}
              </span>
              <span className="block text-[10px] text-gray-400 mt-0.5">
                {showPhone ? "Appuyer pour masquer" : "Cliquez pour afficher le numéro"}
              </span>
            </span>
          </button>
        )}

        {/* CTA buttons */}
        <div className="space-y-2.5 pt-1">

          {/* WhatsApp */}
          {wa && (
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </a>
          )}

          {/* Internal chat */}
          <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
            <DialogTrigger className="w-full h-11 bg-[#f97316] hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
              <MessageCircle className="h-4 w-4" />
              Envoyer un message
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl border-gray-200 shadow-2xl p-0 overflow-hidden gap-0 z-[99999]">
              <DialogHeader className="p-6 pb-3 text-left">
                <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2.5">
                  <span className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-orange-500" />
                  </span>
                  Message au vendeur
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-sm mt-1">
                  Votre message sera envoyé directement au vendeur.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-2 space-y-3">
                <Textarea
                  placeholder="Bonjour, je suis intéressé par votre annonce..."
                  className="min-h-[110px] resize-none rounded-xl bg-gray-50 border-gray-200 focus:border-orange-300 text-[15px] text-gray-800 placeholder:text-gray-400"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    "Est-ce toujours disponible ?",
                    "Quel est votre dernier prix ?",
                    "Peut-on se voir ?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setMessage(q)}
                      className="whitespace-nowrap px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-full text-xs font-semibold transition-colors border border-orange-100"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 sm:justify-between flex-row items-center gap-2">
                <span className="text-[10px] text-gray-400 pl-1 hidden sm:block">
                  Réponse sous 24h en général
                </span>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white gap-2 font-bold px-6 ml-auto"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Envoyer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Phone call */}
          {phoneVerified && (
            <a
              href={`tel:${sellerPhone}`}
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile sticky bottom bar
// ─────────────────────────────────────────────────────────────────────────────
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
  const wa = clean
    ? clean.startsWith("0") && clean.length === 10
      ? "212" + clean.slice(1)
      : clean
    : "";
  const waMsg = `Bonjour, je suis intéressé par votre annonce "${adTitle}" sur Jootiya.`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">
            Prix
          </p>
          <p className="text-lg font-black text-[#f97316] tabular-nums truncate leading-tight">
            {formattedPrice}
          </p>
        </div>
        {clean && (
          <a
            href={`tel:${phone}`}
            aria-label="Appeler le vendeur"
            className="h-12 w-12 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.96] text-white flex items-center justify-center shrink-0 transition-all shadow-sm"
          >
            <Phone className="h-5 w-5" />
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 flex-1 max-w-[160px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.96] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </a>
        )}
        {!clean && !wa && (
          <button
            onClick={() => toast.error("Numéro non disponible.")}
            className="h-12 flex-1 rounded-xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Contacter
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function AirbnbAdPageClient({
  ad, images, sellerName, sellerAvatar, memberSince, sellerPhone,
  formattedPrice, formattedDate, avgRating, totalReviews, isTrusted, user, similarAds = [],
}: AirbnbAdPageClientProps) {
  return (
    <div className="bg-gray-50 min-h-screen pb-28 lg:pb-12 font-sans antialiased">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center gap-3">
          <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-1 text-xs font-medium text-gray-400 min-w-0 overflow-hidden flex-1"
          >
            <Link href="/" className="hover:text-orange-500 transition-colors whitespace-nowrap shrink-0">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
            <Link href="/marketplace" className="hover:text-orange-500 transition-colors whitespace-nowrap shrink-0">
              Annonces
            </Link>
            {ad.category && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
                <Link
                  href={`/categories/${ad.category?.toLowerCase().replace(/\s+/g, "-")}`}
                  className="hover:text-orange-500 transition-colors whitespace-nowrap shrink-0 capitalize"
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

      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-4">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">

          {/* LEFT — main content */}
          <main className="lg:col-span-8 space-y-4 order-2 lg:order-1">
            <MainAdCard
              ad={ad}
              images={images}
              formattedPrice={formattedPrice}
              formattedDate={formattedDate}
              user={user}
            />

            {/* Mobile: seller card below main card */}
            <div className="lg:hidden space-y-4">
              <SellerInfoCard
                ad={ad}
                sellerName={sellerName}
                sellerAvatar={sellerAvatar}
                memberSince={memberSince}
                avgRating={avgRating}
                totalReviews={totalReviews}
                isTrusted={isTrusted}
                sellerPhone={sellerPhone}
              />
              <AdSenseSidebar />
            </div>

            <LocationCard ad={ad} />
            <SimilarAdsCard ads={similarAds} />
          </main>

          {/* RIGHT — sticky sidebar (desktop) */}
          <aside className="lg:col-span-4 order-1 lg:order-2 hidden lg:block">
            <div className="sticky top-16 space-y-4">
              <SellerInfoCard
                ad={ad}
                sellerName={sellerName}
                sellerAvatar={sellerAvatar}
                memberSince={memberSince}
                avgRating={avgRating}
                totalReviews={totalReviews}
                isTrusted={isTrusted}
                sellerPhone={sellerPhone}
              />
              <AdSenseSidebar />
            </div>
          </aside>

        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <MobileStickyBar
        phone={sellerPhone || ""}
        adTitle={ad.title}
        formattedPrice={formattedPrice}
      />
    </div>
  );
}
