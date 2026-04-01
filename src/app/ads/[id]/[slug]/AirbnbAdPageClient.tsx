"use client";

import { useState } from "react";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
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
  user
}: AirbnbAdPageClientProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div dir="ltr" className="bg-white dark:bg-zinc-950 pb-24 md:pb-16 font-sans overflow-x-hidden">
      {/* Airbnb Style Header Navigation */}
      <div className="airbnb-nav-container">
        <div className="main-container h-16 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:underline">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/marketplace" className="hover:underline">Marché</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-zinc-900 dark:text-white font-semibold">{ad.category}</span>
          </nav>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-semibold underline hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-all">
              <Share className="h-4 w-4" /> Partager
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold underline hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-all">
              <Heart className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      <div className="w-full pt-0 md:pt-6">
        {/* Title - Different padding/size for mobile */}
        <h1 className="text-xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-4 md:mb-6 px-4 md:px-0 pt-4 md:pt-0 break-words">
          {ad.title}
        </h1>

        {/* Airbnb Style Image Section */}
        <div className="w-full md:px-0 overflow-hidden">
          {/* Mobile view: Full width aspect-ratio image */}
          <div className="md:hidden w-full aspect-[4/3] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800" onClick={() => setIsLightboxOpen(true)}>
             <Image 
              src={images[0]} 
              alt={ad.title} 
              fill 
              className="object-cover"
              priority
            />
            <button 
              className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm z-10"
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
            >
              <ImageIcon className="h-3 w-3" />
              <span>{images.length} photos</span>
            </button>
          </div>

          {/* Desktop view: Dynamic grid based on image count */}
          <div className={cn(
            "hidden md:grid gap-2 rounded-xl overflow-hidden relative h-[400px]",
            images.length === 1 ? "grid-cols-1" : 
            images.length === 2 ? "grid-cols-2" : 
            "airbnb-grid-container"
          )}>
            {images.length === 1 ? (
              <div className="relative w-full h-full cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                <Image src={images[0]} alt={ad.title} fill className="object-cover hover:scale-105 transition-all duration-500" priority />
              </div>
            ) : images.length === 2 ? (
              <>
                <div className="relative w-full h-full cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                  <Image src={images[0]} alt={ad.title} fill className="object-cover hover:scale-105 transition-all duration-500" priority />
                </div>
                <div className="relative w-full h-full cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                  <Image src={images[1]} alt={ad.title} fill className="object-cover hover:scale-105 transition-all duration-500" />
                </div>
              </>
            ) : (
              <>
                <div className="airbnb-grid-item airbnb-grid-item-main overflow-hidden relative" onClick={() => setIsLightboxOpen(true)}>
                  <Image 
                    src={images[0]} 
                    alt={ad.title} 
                    fill 
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
                <div className="grid grid-cols-2 grid-rows-2 gap-2 col-span-2 row-span-2">
                  {images.slice(1, 5).map((src: string, i: number) => (
                    <div key={i} className="airbnb-grid-item overflow-hidden relative" onClick={() => setIsLightboxOpen(true)}>
                      <Image src={src} alt={`${ad.title} ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                  {/* Only show placeholders if we have 3 or 4 images to maintain grid integrity */}
                  {images.length < 5 && [...Array(4 - (images.length - 1))].map((_, i: number) => (
                    <div key={`fill-${i}`} className="airbnb-grid-item bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <button 
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-6 right-6 bg-white dark:bg-zinc-900 border border-zinc-900 dark:border-zinc-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-zinc-50 transition-all z-10"
            >
              <ImageIcon className="h-4 w-4" /> Afficher toutes les photos
            </button>
          </div>
        </div>

        <div className="main-container flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-12 mt-8">
          <div className="lg:col-span-8 order-2 lg:order-1 px-4 md:px-0">
            <div className="flex items-center justify-between pb-8 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Vendu par {sellerName}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {ad.city} • Membre منذ {memberSince}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative border border-zinc-200 dark:border-zinc-800">
                {sellerAvatar ? (
                  <Image src={sellerAvatar} alt={sellerName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="py-8 space-y-6">
              <div className="flex gap-4">
                <Award className="h-8 w-8 text-zinc-900 dark:text-white mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">Vendeur {isTrusted ? 'Vérifié' : 'Recommandé'}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">Ce vendeur a d'excellents avis et une identité vérifiée.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="h-8 w-8 text-zinc-900 dark:text-white mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">Emplacement idéal</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">L'objet se trouve à {ad.city}, facile d'accès pour remise en main propre.</p>
                </div>
              </div>
            </div>

            <div className="airbnb-section-border">
              <h3 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">À propos de cet objet</h3>
              <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-lg">
                {ad.description}
              </div>
            </div>

            <div className="airbnb-section-border">
              <h3 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">Caractéristiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 uppercase font-black tracking-widest">État</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
          </div>

          <div className="lg:col-span-4 order-1 lg:order-2 px-4 md:px-0">
            <div className="airbnb-sidebar-card">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">{formattedPrice}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-3 w-3 fill-zinc-900 dark:fill-white" />
                  <span>{avgRating || '5.0'}</span>
                  <span className="text-zinc-400 font-normal underline">({totalReviews} avis)</span>
                </div>
              </div>

              <div className="space-y-4">
                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={sellerPhone} />
                <p className="text-center text-xs text-zinc-500 mt-4">
                  Aucun frais ne vous sera prélevé maintenant
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
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
      
      <AdImageGallery 
        images={images} 
        hideMainGallery={true} 
        isForcedOpen={isLightboxOpen} 
        onOpenChange={setIsLightboxOpen} 
      />
    </div>
  );
}
