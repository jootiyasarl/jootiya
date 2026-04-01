import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import { ContactActions } from "@/components/ads/ContactActions";
import { AdCard } from "@/components/ads/AdCard";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { ViralShareButton } from "@/components/ads/ViralShareButton";
import { ShadowViewTracker } from "@/components/ads/ShadowViewTracker";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  Award,
  Star,
  Share,
  Heart,
  Flag,
  Image as ImageIcon
} from "lucide-react";
import { QuickActionFooter } from "@/components/ads/QuickActionFooter";
import Image from "next/image";
import { generateSlug } from "@/lib/seo-utils";
import { SimilarAdsCarousel } from "@/components/ads/SimilarAdsCarousel";

export const revalidate = 3600;

interface AdPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AdPageProps) {
  const { id, slug: urlSlug } = await params;
  const supabase = createSupabaseServerClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
  
  try {
    const { data: ad, error } = await supabase
      .from("ads")
      .select("title, city, description, image_urls, price, currency, slug, id")
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error || !ad) return { title: "Petites Annonces au Maroc | Jootiya" };

    const formattedPrice = ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : "Prix sur demande";
    const metaTitle = `${ad.title} - ${formattedPrice} | Jootiya`;
    const adSlug = ad.slug || urlSlug || generateSlug(ad.title);
    const canonicalUrl = `${baseUrl}/ads/${ad.id}/${adSlug}`;
    
    // Get primary image and ensure it's an absolute URL
    let ogImage = `${baseUrl}/og-image.png`; // Fallback image
    if (ad.image_urls && Array.isArray(ad.image_urls) && ad.image_urls.length > 0) {
      const firstImage = ad.image_urls[0];
      if (firstImage.startsWith('http')) {
        ogImage = firstImage;
      } else {
        const cleanPath = firstImage.startsWith('/') ? firstImage.substring(1) : firstImage;
        // Check if it's a Supabase path that needs the public URL prefix
        if (!cleanPath.startsWith('storage/v1/object/public/')) {
          ogImage = `https://mshnkdqclscfytvdbmre.supabase.co/storage/v1/object/public/ad-images/${cleanPath}`;
        } else {
          ogImage = `${baseUrl}/${cleanPath}`;
        }
      }
    }
    
    return {
      title: metaTitle,
      description: ad.description?.slice(0, 160),
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: metaTitle,
        description: ad.description?.slice(0, 160),
        url: canonicalUrl,
        siteName: 'Jootiya',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: ad.title,
          },
        ],
        locale: 'fr_FR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: ad.description?.slice(0, 160),
        images: [ogImage],
      },
    };
  } catch (err) {
    return { title: "Petites Annonces au Maroc | Jootiya" };
  }
}

export default async function AdPage({ params }: AdPageProps) {
  const { id, slug } = await params;
  const user = await getServerUser();
  const supabase = createSupabaseServerClient();

  // State handles for Airbnb gallery
  // These will be used in the return statements below
  let isLightboxOpen = false; 
  const setIsLightboxOpen = (val: boolean) => { isLightboxOpen = val; };

  console.log("DEBUG: Fetching ad with ID:", id, "and Slug:", slug);

  const { data: ad, error: adError } = await supabase
    .from("ads")
    .select(`
      *,
      profiles:seller_id(phone, full_name, avatar_url, created_at)
    `)
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (adError) {
    console.error("DEBUG: Ad Fetch Error:", adError);
  }

  if (!ad) {
    console.error("DEBUG: Ad not found for ID:", id);
    // Try a simpler query if the first one fails
    const { data: retryAd, error: retryError } = await supabase
      .from("ads")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (retryError) {
      console.error("DEBUG: Retry Error:", retryError);
    }

    if (retryAd) {
      console.log("DEBUG: Ad found on retry without join:", retryAd.id);
      
      // Attempt to fetch profile separately to avoid join issues
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, created_at, phone")
        .eq("id", retryAd.seller_id)
        .maybeSingle();

      const sellerName = profileData?.full_name || "Utilisateur Jootiya";
      const sellerAvatar = profileData?.avatar_url || null;
      const memberSince = profileData?.created_at ? new Date(profileData.created_at).getFullYear() : "2024";
      const sellerPhone = retryAd.phone || profileData?.phone;

      // If found on retry, use it
      const finalAd = { ...retryAd, profiles: profileData };
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
      const formattedPrice = finalAd.price ? `${Number(finalAd.price).toLocaleString()} ${finalAd.currency || 'MAD'}` : "Sur demande";
      const formattedDate = new Date(finalAd.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      const images = (finalAd.image_urls || []).map((img: string) => 
        img.startsWith('http') ? img : `${baseUrl}/${img.startsWith('/') ? img.substring(1) : img}`
      );

      const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: finalAd.seller_id });
      const avgRating = stats?.[0]?.avg_rating || 0;
      const totalReviews = stats?.[0]?.total_reviews || 0;
      const isTrusted = totalReviews > 10 && avgRating >= 4.5;

      const { data: similarAds } = await supabase
        .from("ads")
        .select("*")
        .eq("category", finalAd.category)
        .neq("id", finalAd.id)
        .limit(4);

      return (
        <div dir="ltr" className="bg-white dark:bg-zinc-950 pb-16 font-sans">
          <ShadowViewTracker adId={finalAd.id} category={finalAd.category} />
          
          {/* Airbnb Style Header Navigation */}
          <div className="airbnb-nav-container">
            <div className="main-container h-16 flex items-center justify-between">
              <nav className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <Link href="/" className="hover:underline">Accueil</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/marketplace" className="hover:underline">Marché</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-zinc-900 dark:text-white font-semibold">{finalAd.category}</span>
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

          <div className="main-container pt-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-6">
              {finalAd.title}
            </h1>

            {/* Airbnb Style 5-Image Grid */}
            <div className="airbnb-grid-container group">
              {/* Main Large Image */}
              <div className="airbnb-grid-item airbnb-grid-item-main" onClick={() => setIsLightboxOpen(true)}>
                <Image 
                  src={images[0]} 
                  alt={finalAd.title} 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
              {/* 4 Smaller Images */}
              {images.slice(1, 5).map((src, i) => (
                <div key={i} className="airbnb-grid-item" onClick={() => setIsLightboxOpen(true)}>
                  <Image src={src} alt={`${finalAd.title} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
              {/* Placeholder for missing images to maintain grid */}
              {[...Array(Math.max(0, 4 - (images.length - 1)))].map((_, i) => (
                <div key={`fill-${i}`} className="airbnb-grid-item bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <ImageIcon className="h-8 w-8 opacity-20" />
                </div>
              ))}
              
              <button 
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-6 right-6 bg-white dark:bg-zinc-900 border border-zinc-900 dark:border-zinc-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-zinc-50 transition-all z-10"
              >
                <ImageIcon className="h-4 w-4" /> Afficher toutes les photos
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
              {/* Left Column: Content */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between pb-8 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                      Vendu par {sellerName}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                      {finalAd.city} • Membre depuis {memberSince}
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

                {/* Seller Highlights */}
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
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm">L'objet se trouve à {finalAd.city}, facile d'accès pour remise en main propre.</p>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="airbnb-section-border">
                  <h3 className="text-xl font-semibold mb-6">À propos de cet objet</h3>
                  <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {finalAd.description}
                  </div>
                </div>

                {/* Characteristics Section */}
                <div className="airbnb-section-border">
                  <h3 className="text-xl font-semibold mb-6">Caractéristiques</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <div className={cn("w-2 h-2 rounded-full", finalAd.condition === 'new' ? "bg-emerald-500" : "bg-orange-500")} />
                      </div>
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">État: {finalAd.condition === 'new' ? "Neuf" : "Occasion"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-zinc-500" />
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">Catégorie: {finalAd.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Floating Sidebar */}
              <div className="lg:col-span-4 relative">
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
                    <ContactActions adId={finalAd.id} sellerId={finalAd.seller_id} currentUser={user} sellerPhone={sellerPhone} />
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

          <QuickActionFooter phone={sellerPhone} adTitle={finalAd.title} adPrice={formattedPrice} adId={finalAd.id} sellerId={finalAd.seller_id} currentUser={user} />
          
          {/* Reuse existing lightbox from AdImageGallery but triggered here */}
          <AdImageGallery images={images} hideMainGallery={true} isForcedOpen={isLightboxOpen} onOpenChange={setIsLightboxOpen} />
        </div>
      );
    } else {
      notFound();
    }
  }

  const sellerProfile = ad.profiles;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
  const formattedPrice = ad.price ? `${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : "Sur demande";
  const formattedDate = new Date(ad.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const sellerName = sellerProfile?.full_name || "Utilisateur Jootiya";
  const sellerAvatar = sellerProfile?.avatar_url || null;
  const memberSince = sellerProfile?.created_at ? new Date(sellerProfile.created_at).getFullYear() : "2024";

  const images = (ad.image_urls || []).map((img: string) => 
    img.startsWith('http') ? img : `${baseUrl}/${img.startsWith('/') ? img.substring(1) : img}`
  );

  const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: ad.seller_id });
  const avgRating = stats?.[0]?.avg_rating || 0;
  const totalReviews = stats?.[0]?.total_reviews || 0;
  const isTrusted = totalReviews > 10 && avgRating >= 4.5;

  const { data: similarAds } = await supabase
    .from("ads")
    .select("*")
    .eq("category", ad.category)
    .neq("id", ad.id)
    .limit(4);

  return (
    <div dir="ltr" className="bg-white dark:bg-zinc-950 pb-16 font-sans">
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      
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

      <div className="main-container pt-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white mb-6">
          {ad.title}
        </h1>

        {/* Airbnb Style 5-Image Grid */}
        <div className="airbnb-grid-container group relative">
          {/* Main Large Image */}
          <div className="airbnb-grid-item airbnb-grid-item-main overflow-hidden relative">
            <Image 
              src={images[0]} 
              alt={ad.title} 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          {/* 4 Smaller Images */}
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 col-span-2 row-span-2">
            {images.slice(1, 5).map((src: string, i: number) => (
              <div key={i} className="airbnb-grid-item overflow-hidden relative">
                <Image src={src} alt={`${ad.title} ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
            {/* Placeholder for missing images to maintain grid */}
            {[...Array(Math.max(0, 4 - (images.length - 1)))].map((_, i) => (
              <div key={`fill-${i}`} className="airbnb-grid-item bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <ImageIcon className="h-8 w-8 opacity-20" />
              </div>
            ))}
          </div>
          
          <button 
            className="absolute bottom-6 right-6 bg-white dark:bg-zinc-900 border border-zinc-900 dark:border-zinc-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-zinc-50 transition-all z-10"
          >
            <ImageIcon className="h-4 w-4" /> Afficher toutes les photos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
          {/* Left Column: Content */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between pb-8 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Vendu par {sellerName}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {ad.city} • Membre depuis {memberSince}
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

            {/* Seller Highlights */}
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

            {/* Description Section */}
            <div className="airbnb-section-border">
              <h3 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">À propos de cet objet</h3>
              <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-lg">
                {ad.description}
              </div>
            </div>

            {/* Characteristics Section */}
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

          {/* Right Column: Floating Sidebar */}
          <div className="lg:col-span-4 relative">
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
                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={ad.phone || sellerProfile?.phone} />
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

      <QuickActionFooter phone={ad.phone || sellerProfile?.phone} adTitle={ad.title} adPrice={formattedPrice} adId={ad.id} sellerId={ad.seller_id} currentUser={user} />
      
      {/* Existing gallery functionality remains available */}
      <div className="hidden">
        <AdImageGallery images={images} />
      </div>
    </div>
  );
}
