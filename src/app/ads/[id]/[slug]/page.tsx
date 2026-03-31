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
        <div dir="ltr" className="bg-[#F8FAFC] dark:bg-zinc-950 pb-16 font-sans">
          <ShadowViewTracker adId={finalAd.id} category={finalAd.category} />
          
          <div className="main-container py-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
              <Link href="/" className="hover:text-orange-600 transition-colors">Accueil</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/marketplace" className="hover:text-orange-600 transition-colors">Marché</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-zinc-900 dark:text-white font-black">{finalAd.category || "Annonce"}</span>
            </nav>

            <main className="ad-page-main-grid">
              {/* Left Column: Media & Info */}
              <div className="ad-page-content-column">
                <section className="premium-gallery-container p-4 md:p-6">
                  <AdImageGallery images={images} />
                </section>

                <div className="ad-info-card space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-6">
                      <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                        {finalAd.title}
                      </h1>
                      <div className="premium-glass p-2 rounded-2xl">
                        <FavoriteButton adId={finalAd.id} className="h-12 w-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all" />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="premium-badge bg-orange-50 dark:bg-orange-950/30 text-orange-600">
                        <MapPin className="h-3.5 w-3.5" />
                        {finalAd.city}
                      </div>
                      <div className="premium-badge bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        <Calendar className="h-3.5 w-3.5" />
                        Publié le {formattedDate}
                      </div>
                      <div className="premium-badge bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        <Eye className="h-3.5 w-3.5" />
                        {finalAd.views_count || 1} vues
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800">
                    <h2 className="premium-section-title">Description</h2>
                    <div className="ad-description-prose">
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">
                        {finalAd.description || "Aucune description fournie."}
                      </p>
                    </div>
                  </div>

                  <div className="ad-attribute-grid">
                    <div className="ad-attribute-item">
                      <p className="ad-attribute-label">Catégorie</p>
                      <p className="ad-attribute-value">{finalAd.category || "Autre"}</p>
                    </div>
                    <div className="ad-attribute-item">
                      <p className="ad-attribute-label">État</p>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", finalAd.condition === 'new' ? "bg-emerald-500" : "bg-orange-500")} />
                        <p className="ad-attribute-value">{finalAd.condition === 'new' ? "Neuf" : "Occasion"}</p>
                      </div>
                    </div>
                    <div className="ad-attribute-item">
                      <p className="ad-attribute-label">Référence</p>
                      <p className="ad-attribute-value text-zinc-400">#{finalAd.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>

                {similarAds && similarAds.length > 0 && (
                  <section className="space-y-8 pt-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Annonces similaires</h2>
                      <Link href="/marketplace" className="text-sm font-black text-orange-600 hover:text-orange-700 underline underline-offset-4">Voir tout</Link>
                    </div>
                    <SimilarAdsCarousel ads={similarAds as any[]} />
                  </section>
                )}
              </div>

              {/* Right Column: Sticky Sidebar */}
              <aside className="ad-page-sidebar-column">
                <div className="premium-sidebar-card space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Prix de vente</p>
                    <div className="flex items-baseline gap-2">
                      <p className="premium-price-hero text-orange-600">{formattedPrice}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ContactActions adId={finalAd.id} sellerId={finalAd.seller_id} currentUser={user} sellerPhone={sellerPhone} />
                    <ViralShareButton 
                      adId={finalAd.id} 
                      adTitle={finalAd.title} 
                      adPrice={formattedPrice} 
                      sellerId={finalAd.seller_id} 
                      showAsMainAction={false}
                    />
                  </div>

                  <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black overflow-hidden ring-4 ring-zinc-50 dark:ring-zinc-800/50">
                        {sellerAvatar ? (
                          <Image src={sellerAvatar} alt={sellerName} width={64} height={64} className="object-cover" />
                        ) : (
                          <span className="text-zinc-400">{sellerName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-zinc-900 dark:text-white leading-tight flex items-center gap-1.5">
                          {sellerName}
                          {isTrusted && <Award className="w-5 h-5 text-blue-500 fill-blue-500/10" />}
                        </h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Membre depuis {memberSince}</p>
                      </div>
                    </div>

                    <div className="premium-seller-stats">
                      <div className="text-center space-y-1">
                        <p className="text-xl font-black text-zinc-900 dark:text-white">100%</p>
                        <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Réponse</p>
                      </div>
                      <div className="text-center space-y-1 border-l border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-xl font-black text-zinc-900 dark:text-white">{avgRating || '5.0'}</p>
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        </div>
                        <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">{totalReviews || 0} Avis</p>
                      </div>
                    </div>

                    <Link href={`/profile/${finalAd.seller_id}`} className="flex items-center justify-center w-full h-14 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-sm font-black text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-300">
                      Voir le profil complet
                    </Link>
                  </div>

                  {/* Safety Trust Card */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 ring-1 ring-white/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl leading-tight text-white">Protection Jootiya</h3>
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mt-1 text-emerald-50">Transaction sécurisée</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-200 flex-shrink-0" /> 
                        Identité vérifiée à 100%
                      </li>
                      <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-200 flex-shrink-0" /> 
                        Assistance client dédiée
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </main>
          </div>
          <QuickActionFooter phone={sellerPhone} adTitle={finalAd.title} adPrice={formattedPrice} adId={finalAd.id} sellerId={finalAd.seller_id} currentUser={user} />
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
    <div dir="ltr" className="bg-[#F8FAFC] dark:bg-zinc-950 pb-16 font-sans">
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      
      <div className="main-container py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-orange-600 transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/marketplace" className="hover:text-orange-600 transition-colors">Marché</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-900 dark:text-white font-black">{ad.category || "Annonce"}</span>
        </nav>

        <main className="ad-page-main-grid">
          {/* Left Column: Media & Info */}
          <div className="ad-page-content-column">
            <section className="premium-gallery-container p-4 md:p-6">
              <AdImageGallery images={images} />
            </section>

            <div className="ad-info-card space-y-10">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-6">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                    {ad.title}
                  </h1>
                  <div className="premium-glass p-2 rounded-2xl">
                    <FavoriteButton adId={ad.id} className="h-12 w-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all" />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="premium-badge bg-orange-50 dark:bg-orange-950/30 text-orange-600">
                    <MapPin className="h-3.5 w-3.5" />
                    {ad.city}
                  </div>
                  <div className="premium-badge bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Publié le {formattedDate}
                  </div>
                  <div className="premium-badge bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    <Eye className="h-3.5 w-3.5" />
                    {ad.views_count || 1} vues
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800">
                <h2 className="premium-section-title">Description</h2>
                <div className="ad-description-prose">
                  <p className="whitespace-pre-wrap leading-relaxed font-medium">
                    {ad.description || "Aucune description fournie."}
                  </p>
                </div>
              </div>

              <div className="ad-attribute-grid">
                <div className="ad-attribute-item">
                  <p className="ad-attribute-label">Catégorie</p>
                  <p className="ad-attribute-value">{ad.category || "Autre"}</p>
                </div>
                <div className="ad-attribute-item">
                  <p className="ad-attribute-label">État</p>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", ad.condition === 'new' ? "bg-emerald-500" : "bg-orange-500")} />
                    <p className="ad-attribute-value">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                  </div>
                </div>
                <div className="ad-attribute-item">
                  <p className="ad-attribute-label">Référence</p>
                  <p className="ad-attribute-value text-zinc-400">#{ad.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>

            {similarAds && similarAds.length > 0 && (
              <section className="space-y-8 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Annonces similaires</h2>
                  <Link href="/marketplace" className="text-sm font-black text-orange-600 hover:text-orange-700 underline underline-offset-4">Voir tout</Link>
                </div>
                <SimilarAdsCarousel ads={similarAds as any[]} />
              </section>
            )}
          </div>

          {/* Right Column: Sticky Sidebar */}
          <aside className="ad-page-sidebar-column">
            <div className="premium-sidebar-card space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Prix de vente</p>
                <div className="flex items-baseline gap-2">
                  <p className="premium-price-hero text-orange-600">{formattedPrice}</p>
                </div>
              </div>

              <div className="space-y-4">
                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={ad.phone || sellerProfile?.phone} />
                <ViralShareButton 
                  adId={ad.id} 
                  adTitle={ad.title} 
                  adPrice={formattedPrice} 
                  sellerId={ad.seller_id} 
                  showAsMainAction={false}
                />
              </div>

              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black overflow-hidden ring-4 ring-zinc-50 dark:ring-zinc-800/50">
                    {sellerProfile?.avatar_url ? (
                      <Image src={sellerProfile.avatar_url} alt={sellerName} width={64} height={64} className="object-cover" />
                    ) : (
                      <span className="text-zinc-400">{sellerName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-zinc-900 dark:text-white leading-tight flex items-center gap-1.5">
                      {sellerName}
                      {isTrusted && <Award className="w-5 h-5 text-blue-500 fill-blue-500/10" />}
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Membre depuis {memberSince}</p>
                  </div>
                </div>

                <div className="premium-seller-stats">
                  <div className="text-center space-y-1">
                    <p className="text-xl font-black text-zinc-900 dark:text-white">100%</p>
                    <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Réponse</p>
                  </div>
                  <div className="text-center space-y-1 border-l border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xl font-black text-zinc-900 dark:text-white">{avgRating || '5.0'}</p>
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    </div>
                    <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">{totalReviews || 0} Avis</p>
                  </div>
                </div>

                <Link href={`/profile/${ad.seller_id}`} className="flex items-center justify-center w-full h-14 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-sm font-black text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-300">
                  Voir le profil كامل
                </Link>
              </div>

              {/* Safety Trust Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 ring-1 ring-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl leading-tight text-white">Protection Jootiya</h3>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mt-1 text-emerald-50">Transaction sécurisée</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200 flex-shrink-0" /> 
                    Identité vérifiée à 100%
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200 flex-shrink-0" /> 
                    Assistance client dédiée
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </main>
      </div>
      <QuickActionFooter phone={ad.phone || sellerProfile?.phone} adTitle={ad.title} adPrice={formattedPrice} adId={ad.id} sellerId={ad.seller_id} currentUser={user} />
    </div>
  );
}
