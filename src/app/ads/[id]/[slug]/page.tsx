import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import { ContactActions } from "@/components/ads/ContactActions";
import { AdCard } from "@/components/ads/AdCard";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { ViralShareButton } from "@/components/ads/ViralShareButton";
import { ShadowViewTracker } from "@/components/ads/ShadowViewTracker";
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
          
          <div className="main-container py-4">
            <nav className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap mb-6">
              <Link href="/" className="hover:text-orange-600 transition-colors">Accueil</Link>
              <ChevronRight className="h-3 w-3 text-zinc-300" />
              <Link href="/marketplace" className="hover:text-orange-600 transition-colors">Marché</Link>
              <ChevronRight className="h-3 w-3 text-zinc-300" />
              <span className="text-zinc-900 dark:text-white font-black">{finalAd.category || "Annonce"}</span>
            </nav>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Images & Content */}
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 md:p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <AdImageGallery images={images} />
                </section>

                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h1 className="text-2xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                        {finalAd.title}
                      </h1>
                      <FavoriteButton adId={finalAd.id} className="shrink-0 h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 group transition-all" />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-full">
                        <MapPin className="h-4 w-4" />
                        {finalAd.city}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-full">
                        <Calendar className="h-4 w-4" />
                        {formattedDate}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-full">
                        <Eye className="h-4 w-4" />
                        {finalAd.views_count || 1} vues
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                      Description
                    </h2>
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed text-zinc-600 dark:text-zinc-400 text-base md:text-lg font-medium">
                        {finalAd.description || "Aucune description fournie."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em]">Catégorie</p>
                      <p className="font-bold text-zinc-900 dark:text-white">{finalAd.category || "Autre"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em]">État</p>
                      <p className="font-bold text-zinc-900 dark:text-white">{finalAd.condition === 'new' ? "Neuf" : "Occasion"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em]">Référence</p>
                      <p className="font-bold text-zinc-900 dark:text-white">#{finalAd.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>

                {similarAds && similarAds.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black tracking-tight">Annonces similaires</h2>
                      <Link href="/marketplace" className="text-sm font-bold text-orange-600 hover:underline">Voir plus</Link>
                    </div>
                    <SimilarAdsCarousel ads={similarAds as any[]} />
                  </section>
                )}
              </div>

              {/* Right Column: Pricing & Seller */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="lg:sticky lg:top-[100px] space-y-6">
                  {/* Pricing Card */}
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-800 ring-4 ring-orange-500/5">
                    <div className="space-y-1 mb-6">
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Prix de vente</p>
                      <p className="text-4xl font-black text-orange-600 tracking-tighter">{formattedPrice}</p>
                    </div>
                    <ContactActions adId={finalAd.id} sellerId={finalAd.seller_id} currentUser={user} sellerPhone={sellerPhone} />
                    <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                      <ViralShareButton 
                        adId={finalAd.id} 
                        adTitle={finalAd.title} 
                        adPrice={formattedPrice} 
                        sellerId={finalAd.seller_id} 
                        showAsMainAction={false}
                      />
                    </div>
                  </div>

                  {/* Seller Card */}
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black overflow-hidden ring-4 ring-zinc-50 dark:ring-zinc-800/50">
                        {sellerAvatar ? (
                          <Image src={sellerAvatar} alt={sellerName} width={64} height={64} className="object-cover" />
                        ) : (
                          <span className="text-zinc-400">{sellerName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-zinc-900 dark:text-white leading-tight">
                          {sellerName}
                        </h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Membre depuis {memberSince}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center">
                        <p className="text-xl font-black text-zinc-900 dark:text-white">100%</p>
                        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-1">Réponse</p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center">
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-xl font-black text-zinc-900 dark:text-white">{avgRating || '5.0'}</p>
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        </div>
                        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-1">{totalReviews || 0} Avis</p>
                      </div>
                    </div>

                    <Link href={`/profile/${finalAd.seller_id}`} className="flex items-center justify-center w-full h-12 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-sm font-black text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                      Voir le profil
                    </Link>
                  </div>

                  {/* Trust Badge */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-emerald-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg leading-tight">Protection Jootiya</h3>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Achetez en sécurité</p>
                      </div>
                    </div>
                    <ul className="space-y-3 pt-2">
                      <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-200" /> 
                        Identité vérifiée
                      </li>
                      <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-200" /> 
                        Support client 24/7
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
      
      <div className="main-container py-4">
        <nav className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap mb-6">
          <Link href="/" className="hover:text-orange-600 transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3 text-zinc-300" />
          <Link href="/marketplace" className="hover:text-orange-600 transition-colors">Marché</Link>
          <ChevronRight className="h-3 w-3 text-zinc-300" />
          <span className="text-zinc-900 dark:text-white font-black">{ad.category || "Annonce"}</span>
        </nav>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 md:p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <AdImageGallery images={images} />
            </section>

            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-8">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                    {ad.title}
                  </h1>
                  <FavoriteButton adId={ad.id} className="shrink-0 h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 group transition-all" />
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-full">
                    <MapPin className="h-4 w-4" />
                    {ad.city}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-full">
                    <Calendar className="h-4 w-4" />
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-full">
                    <Eye className="h-4 w-4" />
                    {ad.views_count || 1} vues
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                  Description
                </h2>
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-zinc-600 dark:text-zinc-400 text-base md:text-lg font-medium">
                    {ad.description || "Aucune description fournie."}
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em]">Catégorie</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{ad.category || "Autre"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em]">État</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em]">Référence</p>
                  <p className="font-bold text-zinc-900 dark:text-white">#{ad.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>

            {similarAds && similarAds.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight">Annonces similaires</h2>
                  <Link href="/marketplace" className="text-sm font-bold text-orange-600 hover:underline">Voir plus</Link>
                </div>
                <SimilarAdsCarousel ads={similarAds as any[]} />
              </section>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-[100px] space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-800 ring-4 ring-orange-500/5">
                <div className="space-y-1 mb-6">
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Prix de vente</p>
                  <p className="text-4xl font-black text-orange-600 tracking-tighter">{formattedPrice}</p>
                </div>
                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={ad.phone || sellerProfile?.phone} />
                <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <ViralShareButton 
                    adId={ad.id} 
                    adTitle={ad.title} 
                    adPrice={formattedPrice} 
                    sellerId={ad.seller_id} 
                    showAsMainAction={false}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black overflow-hidden ring-4 ring-zinc-50 dark:ring-zinc-800/50">
                    {sellerProfile?.avatar_url ? (
                      <Image src={sellerProfile.avatar_url} alt={sellerName} width={64} height={64} className="object-cover" />
                    ) : (
                      <span className="text-zinc-400">{sellerName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-zinc-900 dark:text-white leading-tight">
                      {sellerName}
                      {isTrusted && <Award className="w-5 h-5 text-blue-500 inline-block ml-1" />}
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Membre depuis {memberSince}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center">
                    <p className="text-xl font-black text-zinc-900 dark:text-white">100%</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-1">Réponse</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xl font-black text-zinc-900 dark:text-white">{avgRating || '5.0'}</p>
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    </div>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-1">{totalReviews || 0} Avis</p>
                  </div>
                </div>

                <Link href={`/profile/${ad.seller_id}`} className="flex items-center justify-center w-full h-12 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-sm font-black text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                  Voir le profil
                </Link>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight">Protection Jootiya</h3>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Achetez en sécurité</p>
                  </div>
                </div>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" /> 
                    Identité vérifiée
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" /> 
                    Support client 24/7
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
