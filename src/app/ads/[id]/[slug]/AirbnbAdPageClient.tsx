"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AirbnbAdPageClient — Avito-Style Professional Ad Detail Page
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * LAYOUT (matches reference image):
 * ┌──────────────────────────────┬───────────────────────────┐
 * │  LEFT (Main Content) 8 cols  │  RIGHT (Sidebar) 4 cols   │
 * │                              │  sticky top-[72px]         │
 * │  • Title + badges + meta     │  • Price (large)           │
 * │  • Photo Gallery             │  • WhatsApp button (green) │
 * │    (hero + thumbnails)       │  • Phone + message buttons │
 * │  • Specs Grid (2-col)        │  • AdSense unit            │
 * │  • Description               │  • Seller card             │
 * │  • Location                  │  • Safety tips             │
 * │  • Similar Ads grid          │                           │
 * └──────────────────────────────┴───────────────────────────┘
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// ── Load Leaflet map client-side only (Leaflet requires window/document) ──────
const AdMap = dynamic(() => import("@/components/ads/AdMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[180px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <MapPin className="h-6 w-6 text-gray-300 animate-bounce" />
    </div>
  ),
});

// Gallery is code-split but still SSR'd (default ssr: true) — the hero
// image stays in the initial HTML for LCP/SEO while its JS loads lazily.
const PdpGallery = dynamic(() =>
  import("@/components/ads/PdpGallery").then((m) => m.PdpGallery)
);
import {
  MapPin, Clock, ShieldCheck, ChevronRight,
  CheckCircle2, User, Flag, Tag, Layers, Hash,
  Star, Phone, MessageCircle, Send, Loader2, Eye,
  Calendar, Package,
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
import { AdUnit } from "@/components/ads/AdUnit";

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
// Utilities
// ─────────────────────────────────────────────────────────────────
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

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("fill-current shrink-0", className)} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// TITLE BLOCK — top of the left column (all viewports)
// Badges + title + meta; price box is mobile-only (desktop shows it
// in the sticky sidebar instead)
// ─────────────────────────────────────────────────────────────────
function TitleBlock({
  ad, formattedPrice, formattedDate,
}: {
  ad: any; formattedPrice: string; formattedDate: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {ad.is_featured && (
          <span className="bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-amber-100">
            À la une
          </span>
        )}
        {ad.condition && (
          <span className="bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-sky-100">
            {ad.condition === "new" ? "Neuf" : "Occasion"}
          </span>
        )}
      </div>
      <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-snug">
        {ad.title}
      </h1>
      {/* Mobile-only price — desktop price lives in the sticky sidebar */}
      <div className="lg:hidden bg-amber-50/60 rounded-xl px-4 py-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-700/60 mb-0.5">Prix</p>
        <p className="text-[2rem] font-black text-amber-600 tabular-nums leading-none">{formattedPrice}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-gray-400 font-medium">
        {ad.city && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />{ad.city}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />{formattedDate}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />Annonce #{ad.id?.slice(0, 6).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SPECS GRID — 2-column professional specs table
// ─────────────────────────────────────────────────────────────────
interface SpecItem {
  icon: React.ElementType;
  label: string;
  value: string;
}

function SpecsGrid({ specs }: { specs: SpecItem[] }) {
  if (specs.length === 0) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
        <span className="h-1 w-4 rounded-full bg-orange-500 inline-block" />
        Caractéristiques
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
        {specs.map((spec, i) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.label}
              className={cn(
                "flex items-center justify-between py-3 px-0",
                i < specs.length - 1 && "border-b border-gray-50 sm:border-b"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="text-sm text-gray-500 truncate">{spec.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900 ml-3 shrink-0">{spec.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DESCRIPTION BLOCK
// ─────────────────────────────────────────────────────────────────
function DescriptionBlock({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const raw   = text?.trim() || "";
  const lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return <p className="text-sm text-gray-400 italic">Aucune description fournie.</p>;
  }

  const LIMIT = 5;
  const visible = expanded ? lines : lines.slice(0, LIMIT);
  const hasMore = lines.length > LIMIT;

  return (
    <div>
      <div className="space-y-2.5">
        {visible.map((l, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed">{l}</p>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-3 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LOCATION SECTION — OpenStreetMap via Leaflet (dynamic import)
// ─────────────────────────────────────────────────────────────────
function LocationSection({ city, neighborhood, ad }: { city?: string; neighborhood?: string; ad: any }) {
  const hasCoords = typeof ad.latitude === "number" && typeof ad.longitude === "number";
  const fullLocation = [neighborhood, city].filter(Boolean).join(", ");

  // No location data at all — skip the section
  if (!city && !neighborhood && !hasCoords) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
        <span className="h-1 w-4 rounded-full bg-orange-500 inline-block" />
        Localisation
      </h2>

      {/* City label */}
      {fullLocation && (
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{fullLocation}</p>
            {ad.country && <p className="text-xs text-gray-400 mt-0.5">{ad.country}</p>}
          </div>
        </div>
      )}

      {/* Map — real OSM map if coordinates exist, static fallback otherwise */}
      {hasCoords ? (
        <>
          <AdMap
            lat={ad.latitude}
            lng={ad.longitude}
            title={ad.title}
            city={fullLocation}
            heightClass="h-[180px]"
          />
          <a
            href={`https://maps.openstreetmap.org/?mlat=${ad.latitude}&mlon=${ad.longitude}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5" />
            Ouvrir dans OpenStreetMap
          </a>
        </>
      ) : (
        /* Fallback: no coords — show a static placeholder with city name */
        <div className="relative h-[180px] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400">
          <MapPin className="h-8 w-8 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">{fullLocation}</p>
          <p className="text-xs text-gray-400">Coordonnées non disponibles</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SELLER AVATAR
// ─────────────────────────────────────────────────────────────────
function SellerAvatar({ avatar, name, size = "md" }: { avatar: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const FB  = "/icon-512x512.png";
  const cls = { sm: "h-10 w-10 rounded-xl", md: "h-12 w-12 rounded-2xl", lg: "h-14 w-14 rounded-2xl" };
  const px  = { sm: 40, md: 48, lg: 56 };
  return (
    <div className={cn("relative overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-gray-400", cls[size])}>
      {avatar && canOptimise(avatar) ? (
        <Image src={avatar} alt={name} fill loading="lazy" sizes={`${px[size]}px`} className="object-cover"
          onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FB) t.src = FB; }} />
      ) : avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : <User className="h-5 w-5" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SIDEBAR CTA BUTTONS
// ─────────────────────────────────────────────────────────────────
function SidebarCTA({
  adId, sellerId, sellerPhone, user, adTitle, formattedPrice,
}: {
  adId: string; sellerId: string; sellerPhone: string | undefined;
  user: any; adTitle: string; formattedPrice: string;
}) {
  const router = useRouter();
  const [msgOpen, setMsgOpen]     = useState(false);
  const [message, setMessage]     = useState("");
  const [sending, setSending]     = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const clean = sellerPhone?.replace(/\D/g, "") || "";
  const wa    = clean ? toWaNumber(clean) : "";
  const waMsg = `Bonjour, je suis intéressé par votre annonce "${adTitle}" à ${formattedPrice}. Est-elle toujours disponible ?`;

  const handleWa = () => {
    if (!wa) { toast.error("Numéro non disponible."); return; }
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`, "_blank");
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const r = await sendMessageAction({ adId, sellerId, content: message.trim() });
      if (r.error) {
        if (r.error.includes("connecter")) router.push(`/login?next=/ads/${adId}`);
        else toast.error(r.error);
        return;
      }
      setMsgOpen(false); setMessage("");
      toast.success("Message envoyé !");
      router.push(`/dashboard/messages?id=${r.conversationId}`);
    } catch { toast.error("Erreur lors de l'envoi."); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-2.5">
      {/* WhatsApp — full green */}
      <button
        onClick={handleWa}
        className="w-full h-[52px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-[15px] rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm"
      >
        <WaIcon className="w-5 h-5" />
        Contacter via WhatsApp
      </button>

      {/* Phone button */}
      {clean ? (
        showPhone ? (
          <a
            href={`tel:${sellerPhone}`}
            className="w-full h-[52px] bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-black text-[15px] rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            <Phone className="h-5 w-5" />
            {sellerPhone}
          </a>
        ) : (
          <button
            onClick={() => setShowPhone(true)}
            className="w-full h-[52px] bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-black text-[15px] rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            <Phone className="h-5 w-5" />
            Afficher le numéro
          </button>
        )
      ) : null}

      {/* Message — outline */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogTrigger className="w-full h-11 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all">
          <MessageCircle className="h-4 w-4" />
          Envoyer un message
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-gray-100 shadow-2xl p-0 overflow-hidden gap-0 z-[99999]">
          <DialogHeader className="p-6 pb-3 text-left">
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4 text-gray-600" />
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
              className="min-h-[110px] resize-none rounded-2xl bg-gray-50 border-gray-200 focus:border-gray-400 text-[15px] text-gray-800 placeholder:text-gray-400"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["Est-ce toujours disponible ?", "Quel est votre dernier prix ?", "Peut-on se voir ?"].map(q => (
                <button key={q} onClick={() => setMessage(q)}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-semibold transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 sm:justify-between flex-row items-center gap-2">
            <span className="text-[10px] text-gray-400 pl-1 hidden sm:block">Réponse sous 24h en général</span>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white gap-2 font-bold px-6 ml-auto"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SIDEBAR — Right column (sticky)
// Title + Price + CTAs + Seller + Safety
// ─────────────────────────────────────────────────────────────────
function DesktopSidebar({
  ad, formattedPrice, sellerName, sellerAvatar,
  memberSince, avgRating, totalReviews, isTrusted, sellerPhone, user,
}: {
  ad: any; formattedPrice: string;
  sellerName: string; sellerAvatar: string | null;
  memberSince: string | number; avgRating: number; totalReviews: number;
  isTrusted: boolean; sellerPhone?: string; user: any;
}) {
  return (
    <div className="sticky top-[72px] space-y-3">

      {/* ── 1. PRICE card ── */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-1">Prix</p>
        <p className="text-[2rem] font-black text-gray-900 tabular-nums leading-none tracking-tight">
          {formattedPrice}
        </p>
        <p className="text-[11px] text-gray-400 mt-1.5">Négociable avec le vendeur</p>
      </div>

      {/* ── 2. CTA BUTTONS — WhatsApp / Phone / Message ── */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <SidebarCTA
          adId={ad.id}
          sellerId={ad.seller_id}
          sellerPhone={sellerPhone}
          user={user}
          adTitle={ad.title}
          formattedPrice={formattedPrice}
        />
      </div>

      {/* ── 3. ADVERTISEMENT — directly under the contact buttons ── */}
      <AdUnit format="rectangle" minHeight={280} className="my-0" />

      {/* ── 3. SELLER CARD ── */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Vendeur</h2>
        <div className="flex items-center gap-3">
          <SellerAvatar avatar={sellerAvatar} name={sellerName} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-black text-gray-900 text-[15px] truncate">{sellerName}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              Membre depuis {memberSince}
            </p>
            {totalReviews > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={cn("h-3 w-3", s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200")}
                  />
                ))}
                <span className="text-[11px] text-gray-500 ml-1 font-semibold">
                  {avgRating.toFixed(1)} ({totalReviews})
                </span>
              </div>
            )}
          </div>
          {isTrusted && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-emerald-100 shrink-0">
              <CheckCircle2 className="h-3 w-3" />Vérifié
            </span>
          )}
        </div>
        <Link
          href={`/seller/${ad.seller_id}`}
          className="mt-4 w-full h-9 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
        >
          <User className="h-3.5 w-3.5" />
          Voir le profil du vendeur
        </Link>
      </div>

      {/* ── 4. SAFETY TIPS ── */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
          <h3 className="text-xs font-black text-amber-800 uppercase tracking-wide">Conseils de sécurité</h3>
        </div>
        <ul className="space-y-1.5">
          {[
            "Rencontrez le vendeur dans un lieu public.",
            "Vérifiez le produit avant tout paiement.",
            "Ne partagez jamais vos données bancaires.",
            "Privilégiez le paiement en espèces.",
          ].map(t => (
            <li key={t} className="flex items-start gap-2 text-[11px] text-amber-700 leading-relaxed">
              <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* ── 5. REPORT ── */}
      <button className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium py-1">
        <Flag className="h-3.5 w-3.5" />
        Signaler cette annonce
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SIMILAR ADS GRID — Avito-style
// ─────────────────────────────────────────────────────────────────
function RelatedAdCard({ ad }: { ad: any }) {
  const FB  = "/icon-512x512.png";
  const raw = ad.image_urls?.[0];
  const src = raw?.startsWith("http") ? raw
    : raw ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-images/${raw.startsWith("/") ? raw.slice(1) : raw}`
    : FB;
  const slug  = ad.slug || ad.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const price = ad.price
    ? `${Number(ad.price).toLocaleString("fr-FR")} ${ad.currency || "MAD"}`
    : "Sur demande";

  return (
    <Link href={`/ads/${ad.id}/${slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {canOptimise(src) ? (
            <Image src={src} alt={ad.title} fill loading="lazy"
              sizes="(max-width:640px) 50vw, 25vw"
              className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
              onError={e => { const t = e.currentTarget as HTMLImageElement; if (t.src !== FB) t.src = FB; }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={ad.title} loading="lazy"
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
          )}
          {ad.condition && (
            <div className="absolute top-2 left-2 z-10">
              <span className={cn("text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded",
                ad.condition === "new" ? "bg-emerald-500 text-white" : "bg-white/90 text-gray-700 border border-gray-200/60")}>
                {ad.condition === "new" ? "Neuf" : "Occasion"}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-[14px] font-black text-amber-600 tabular-nums">{price}</p>
          <h3 className="text-gray-800 font-semibold text-[12px] leading-snug line-clamp-2 mt-0.5">{ad.title}</h3>
          {ad.city && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-1.5">
              <MapPin className="h-2.5 w-2.5 shrink-0" />{ad.city}
            </span>
          )}
        </div>
        <div className="h-[2px] bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
// MOBILE STICKY BAR
// ─────────────────────────────────────────────────────────────────
function MobileStickyBar({ phone, adTitle, formattedPrice }: { phone: string; adTitle: string; formattedPrice: string }) {
  const clean = phone?.replace(/\D/g, "") || "";
  const wa    = clean ? toWaNumber(clean) : "";
  const waMsg = `Bonjour, je suis intéressé par votre annonce "${adTitle}" à ${formattedPrice}. Est-elle toujours disponible ?`;
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
      <div className="max-w-xl mx-auto flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Prix</p>
          <p className="text-lg font-black text-amber-600 tabular-nums truncate leading-tight">{formattedPrice}</p>
        </div>
        {clean && (
          <a href={`tel:${phone}`} aria-label="Appeler le vendeur"
            className="h-12 w-12 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.96] text-white flex items-center justify-center shrink-0 transition-all shadow-sm">
            <Phone className="h-5 w-5" />
          </a>
        )}
        {wa && (
          <a href={`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer"
            className="h-12 flex-1 max-w-[160px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.96] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
            <WaIcon className="w-4 h-4" />
            WhatsApp
          </a>
        )}
        {!clean && !wa && (
          <button onClick={() => toast.error("Numéro non disponible.")}
            className="h-12 flex-1 rounded-xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-2">
            <Phone className="h-4 w-4" />Contacter
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────
export function AirbnbAdPageClient({
  ad, images, sellerName, sellerAvatar, memberSince, sellerPhone,
  formattedPrice, formattedDate, avgRating, totalReviews, isTrusted, user, similarAds = [],
}: AirbnbAdPageClientProps) {
  const safeImages = images.length > 0 ? images : ["/icon-512x512.png"];

  // Build specs from available ad fields
  const specs: SpecItem[] = [
    ad.category  && { icon: Tag,          label: "Catégorie",  value: ad.category },
    ad.condition && { icon: Layers,        label: "État",       value: ad.condition === "new" ? "Neuf" : "Occasion" },
    ad.city      && { icon: MapPin,        label: "Ville",      value: ad.city },
    ad.created_at && { icon: Calendar,    label: "Publié le",  value: formattedDate },
    ad.id        && { icon: Hash,          label: "Référence",  value: ad.id.slice(0, 8).toUpperCase() },
    ad.brand     && { icon: Package,       label: "Marque",     value: ad.brand },
    ad.model     && { icon: Package,       label: "Modèle",     value: ad.model },
    ad.year      && { icon: Calendar,      label: "Année",      value: String(ad.year) },
    ad.mileage   && { icon: Eye,           label: "Kilométrage", value: `${Number(ad.mileage).toLocaleString("fr-FR")} km` },
  ].filter(Boolean) as SpecItem[];

  return (
    <div className="bg-gray-50 min-h-screen pb-28 lg:pb-12 font-sans antialiased">

      {/* ══ BREADCRUMB ══════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs font-medium text-gray-400 min-w-0 overflow-hidden">
            <Link href="/" className="hover:text-gray-700 transition-colors whitespace-nowrap shrink-0">Accueil</Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
            <Link href="/marketplace" className="hover:text-gray-700 transition-colors whitespace-nowrap shrink-0">Annonces</Link>
            {ad.category && (<>
              <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
              <Link href={`/categories/${ad.category?.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-gray-700 transition-colors whitespace-nowrap shrink-0 capitalize">
                {ad.category}
              </Link>
            </>)}
            <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />
            <span className="truncate text-gray-700 font-semibold">{ad.title}</span>
          </nav>
        </div>
      </div>

      {/* ══ MAIN GRID ════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-4">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5">

          {/* ╔══════════════════════════════════════════════
              LEFT — Main Content (8 cols)
              Order: Gallery → Specs → Description → Location → Similar
          ════════════════════════════════════════════════╝ */}
          <main className="lg:col-span-8 space-y-4 order-2 lg:order-1">

            {/* ── TITLE + badges + meta (price shows here on mobile only) ── */}
            <TitleBlock
              ad={ad}
              formattedPrice={formattedPrice}
              formattedDate={formattedDate}
            />

            {/* ── GALLERY ── */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <PdpGallery
                images={safeImages}
                title={ad.title}
                adId={ad.id}
                user={user}
                onShare={() => shareAd(ad.title)}
              />
            </div>

            {/* ── SPECS GRID ── */}
            {specs.length > 0 && <SpecsGrid specs={specs} />}

            {/* ── DESCRIPTION ── */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-1 w-4 rounded-full bg-orange-500 inline-block" />
                Description
              </h2>
              <DescriptionBlock text={ad.description} />
            </div>

            {/* ── LOCATION ── */}
            <LocationSection city={ad.city} neighborhood={ad.neighborhood} ad={ad} />

            {/* ── MOBILE: Seller card ── */}
            <div className="lg:hidden bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Vendeur</h2>
              <div className="flex items-center gap-3">
                <SellerAvatar avatar={sellerAvatar} name={sellerName} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-gray-900 text-[15px] truncate">{sellerName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />Membre depuis {memberSince}
                  </p>
                  {totalReviews > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={cn("h-3 w-3", s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                      ))}
                      <span className="text-[11px] text-gray-500 ml-1">{avgRating.toFixed(1)} ({totalReviews})</span>
                    </div>
                  )}
                </div>
                {isTrusted && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-emerald-100 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />Vérifié
                  </span>
                )}
              </div>
            </div>

            {/* ── MOBILE: CTA ── */}
            <div className="lg:hidden bg-white border border-gray-100 rounded-xl p-5">
              <SidebarCTA
                adId={ad.id}
                sellerId={ad.seller_id}
                sellerPhone={sellerPhone}
                user={user}
                adTitle={ad.title}
                formattedPrice={formattedPrice}
              />
            </div>

            {/* ── SIMILAR ADS ── */}
            {similarAds.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <span className="h-1 w-4 rounded-full bg-orange-500 inline-block" />
                    Annonces similaires
                  </h2>
                  {ad.category && (
                    <Link
                      href={`/categories/${ad.category?.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                    >
                      Voir tout <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similarAds.map(sim => (
                    <RelatedAdCard key={sim.id} ad={sim} />
                  ))}
                </div>
              </div>
            )}

            {/* ── ADVERTISEMENT (mobile + below similar ads) ── */}
            <AdUnit format="auto" minHeight={280} className="my-0" />

            {/* ── REPORT ── */}
            <div className="pb-1">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
                <Flag className="h-3.5 w-3.5" />
                Signaler cette annonce
              </button>
            </div>
          </main>

          {/* ╔══════════════════════════════════════════════
              RIGHT — Sticky Sidebar (4 cols, desktop only)
          ════════════════════════════════════════════════╝ */}
          <aside className="lg:col-span-4 order-1 lg:order-2 hidden lg:block">
            <DesktopSidebar
              ad={ad}
              formattedPrice={formattedPrice}
              sellerName={sellerName}
              sellerAvatar={sellerAvatar}
              memberSince={memberSince}
              avgRating={avgRating}
              totalReviews={totalReviews}
              isTrusted={isTrusted}
              sellerPhone={sellerPhone}
              user={user}
            />
          </aside>

        </div>
      </div>

      {/* ══ MOBILE STICKY BOTTOM BAR ════════════════════════════════ */}
      <MobileStickyBar
        phone={sellerPhone || ""}
        adTitle={ad.title}
        formattedPrice={formattedPrice}
      />
    </div>
  );
}
