"use client";

import { useState } from "react";
// Use standard <img> where possible to avoid edge cases with next/image during hydration
import Link from "next/link";
import { 
  ChevronRight, 
  Share, 
  Heart, 
  ImageIcon, 
  Award, 
  MapPin, 
  Star, 
  Flag,
  ShieldCheck 
} from "lucide-react";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import { ContactActions } from "@/components/ads/ContactActions";
import { QuickActionFooter } from "@/components/ads/QuickActionFooter";

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
  similarAds = []
}: AirbnbAdPageClientProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div dir="ltr" className="bg-zinc-50 dark:bg-zinc-950 pb-24 md:pb-16 font-sans overflow-x-hidden">
      {/* Airbnb Style Header Navigation */}
      <div className="bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-100 dark:border-zinc-900 backdrop-blur-xl">
        <div className="main-container h-16 flex items-center justify-between">
          <nav className="flex min-w-0 items-center gap-2 text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:underline">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/marketplace" className="hover:underline">Marché</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="truncate text-zinc-900 dark:text-white font-black">{ad.category}</span>
          </nav>
          <div className="hidden sm:flex items-center gap-2">
            <button className="flex items-center gap-2 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-2 rounded-xl transition-all">
              <Share className="h-4 w-4" /> Partager
            </button>
            <button className="flex items-center gap-2 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-2 rounded-xl transition-all">
              <Heart className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      <div className="w-full pt-0 md:pt-6">
        {/* Title - Different padding/size for mobile */}
        <div className="main-container px-4 md:px-8">
          <div className="mb-4 md:mb-6 pt-4 md:pt-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">
              {ad.is_featured && <span className="rounded-full bg-orange-50 px-3 py-1">À la une</span>}
              <span>{formattedDate}</span>
            </div>
            <h1 className="max-w-4xl text-2xl md:text-4xl font-black tracking-tight text-zinc-950 dark:text-white break-words">
              {ad.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-orange-500" />
                {ad.city || "Maroc"}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                {avgRating || "5.0"} ({totalReviews} avis)
              </span>
            </div>
          </div>
        </div>

        {/* Desktop & Mobile: Single Main Image with Lightbox Trigger */}
        <div className="main-container px-0 md:px-8 overflow-hidden">
          <div className="w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-none md:rounded-[2rem] cursor-pointer group shadow-sm" onClick={() => setIsLightboxOpen(true)}>
             <img 
              src={images[0]} 
              alt={ad.title} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
              decoding="async"
              onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (t.src !== '/icon-512x512.png') t.src = '/icon-512x512.png'; }}
            />
            {/* Overlay Gradient for better button visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <button 
              className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs md:text-sm font-black flex items-center gap-2 shadow-lg z-10 hover:bg-white dark:hover:bg-zinc-900 transition-all md:scale-95 md:group-hover:scale-100"
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
            >
              <ImageIcon className="h-4 w-4" />
              <span>{images.length} {images.length > 1 ? 'photos' : 'photo'}</span>
            </button>
          </div>
        </div>

        <div className="main-container flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-10 mt-6 md:mt-8 px-4 md:px-8">
          <div className="lg:col-span-8 order-2 lg:order-1 space-y-5 md:space-y-6">
            <div className="rounded-[1.75rem] border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                  Vendu par {sellerName}
                </h2>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                  {ad.city} • Membre منذ {memberSince}
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative border border-zinc-200 dark:border-zinc-800 shrink-0">
                {sellerAvatar ? (
                  <img src={sellerAvatar} alt={sellerName} className="absolute inset-0 h-full w-full object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (t.src !== '/icon-512x512.png') t.src = '/icon-512x512.png'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 space-y-5">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/30">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-black text-zinc-900 dark:text-white">Vendeur {isTrusted ? 'Vérifié' : 'Recommandé'}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">Ce vendeur a d'excellents avis et une identité vérifiée.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-black text-zinc-900 dark:text-white">Emplacement idéal</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">L'objet se trouve à {ad.city}, facile d'accès pour remise en main propre.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h3 className="text-xl font-black mb-4 text-zinc-900 dark:text-white">Description</h3>
              <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                {ad.description}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h3 className="text-xl font-black mb-5 text-zinc-900 dark:text-white">Détails de l'annonce</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 uppercase font-black tracking-widest">État</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 uppercase font-black tracking-widest">Catégorie</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{ad.category}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50/60 p-5 dark:border-orange-900/40 dark:bg-orange-950/20 sm:p-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                Conseils de sécurité
              </h3>
              <ul className="space-y-2 text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-300">
                <li>Rencontrez le vendeur dans un lieu public.</li>
                <li>Vérifiez l'article avant de payer.</li>
                <li>Ne partagez jamais vos informations sensibles.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-28 rounded-[2rem] border border-zinc-100 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">Prix</p>
                  <span className="mt-1 block text-3xl font-black tracking-tight text-orange-600 dark:text-orange-500">{formattedPrice}</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-zinc-50 px-2.5 py-1 text-sm font-bold dark:bg-zinc-800">
                  <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                  <span>{avgRating || '5.0'}</span>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900">
                  {sellerAvatar ? (
                    <img src={sellerAvatar} alt={sellerName} className="absolute inset-0 h-full w-full object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (t.src !== '/icon-512x512.png') t.src = '/icon-512x512.png'; }} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-base font-black text-zinc-400">
                      {sellerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{sellerName}</p>
                  <p className="text-xs font-medium text-zinc-500">Membre depuis {memberSince}</p>
                </div>
              </div>

              <div className="space-y-4">
                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={sellerPhone} />
                <p className="text-center text-xs text-zinc-500 mt-4">
                  Aucun frais ne vous sera prélevé maintenant
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between text-sm font-bold text-zinc-600 dark:text-zinc-300">
                  <span>Prix demandé</span>
                  <span>{formattedPrice}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm font-semibold underline decoration-zinc-300">
                <Flag className="h-4 w-4" /> Signaler cette annonce
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickActionFooter phone={sellerPhone || ""} adTitle={ad.title} adPrice={formattedPrice} adId={ad.id} sellerId={ad.seller_id} currentUser={user} />

      {/* Similar Ads Section */}
      {similarAds.length > 0 && (
        <div className="main-container mt-12 px-4 md:px-8">
          <h2 className="text-2xl font-black mb-6 text-zinc-900 dark:text-white">Annonces similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarAds.map((similarAd) => {
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
              const firstImage = similarAd.image_urls?.[0];
              const imageUrl = firstImage?.startsWith('http')
                ? firstImage
                : firstImage
                  ? `${supabaseUrl}/storage/v1/object/public/ad-images/${firstImage.startsWith('/') ? firstImage.substring(1) : firstImage}`
                  : '/placeholder-ad.jpg';
              const adSlug = similarAd.slug || similarAd.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const formattedSimilarPrice = similarAd.price
                ? `${Number(similarAd.price).toLocaleString()} ${similarAd.currency || 'MAD'}`
                : 'Sur demande';

              return (
                <Link
                  key={similarAd.id}
                  href={`/ads/${similarAd.id}/${adSlug}`}
                  className="block"
                >
                  <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={similarAd.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (t.src !== '/icon-512x512.png') t.src = '/icon-512x512.png'; }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-white line-clamp-2 mb-2">{similarAd.title}</h3>
                      <p className="text-orange-600 font-black">{formattedSimilarPrice}</p>
                      <p className="text-xs text-zinc-500 mt-1">{similarAd.city}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <AdImageGallery
        images={images}
        hideMainGallery={true}
        isForcedOpen={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
      />
    </div>
  );
}
