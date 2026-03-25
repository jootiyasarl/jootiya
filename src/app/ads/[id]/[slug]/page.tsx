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
        <div dir="ltr" className="bg-[#F8FAFC] dark:bg-zinc-950 pb-8 font-sans">
          <ShadowViewTracker adId={finalAd.id} category={finalAd.category} />
          
          <div className="mb-4 md:mb-6">
            <nav className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
              <Link href="/" className="hover:text-orange-600 shrink-0">Accueil</Link>
              <ChevronRight className="h-3 w-3 text-zinc-300 shrink-0" />
              <Link href="/marketplace" className="hover:text-orange-600 shrink-0">Marché</Link>
              <ChevronRight className="h-3 w-3 text-zinc-300 shrink-0" />
              <span className="text-orange-600 font-black shrink-0">{finalAd.category || "Annonce"}</span>
            </nav>
          </div>
          
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <section className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                  <AdImageGallery images={images} />
                </section>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-orange-600 tracking-tight">{formattedPrice}</p>
                      <FavoriteButton adId={finalAd.id} className="h-10 w-10 hover:bg-red-50 rounded-xl" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-white leading-tight">
                      {finalAd.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-500">
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-500" />{finalAd.city}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-300" />
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-orange-500" />{formattedDate}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-300" />
                      <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-orange-500" />{finalAd.views_count || 1} vues</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                    <h2 className="text-lg font-black mb-4">Description</h2>
                    <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {finalAd.description || "Aucune description fournie."}
                    </p>
                    
                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                      <ViralShareButton 
                        adId={finalAd.id} 
                        adTitle={finalAd.title} 
                        adPrice={formattedPrice} 
                        sellerId={finalAd.seller_id} 
                        showAsMainAction={true}
                      />
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Catégorie</p>
                        <p className="font-bold">{finalAd.category || "Autre"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">État</p>
                        <p className="font-bold">{finalAd.condition === 'new' ? "Neuf" : "Occasion"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {similarAds && similarAds.length > 0 && (
                  <section className="pt-8">
                    <h2 className="text-xl font-black mb-6">Annonces similaires</h2>
                    <SimilarAdsCarousel ads={similarAds as any[]} />
                  </section>
                )}
              </div>

      <aside className="lg:col-span-4 space-y-4">
        <div className="lg:sticky lg:top-[180px] space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Prix</p>
            <p className="text-3xl font-black text-orange-600 mb-6">{formattedPrice}</p>
            <ContactActions adId={finalAd.id} sellerId={finalAd.seller_id} currentUser={user} sellerPhone={sellerPhone} />
          </div>

          {/* Seller Card in Fallback */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-black overflow-hidden ring-2 ring-orange-500/10 text-zinc-400">
                {sellerAvatar ? (
                  <Image src={sellerAvatar} alt={sellerName} width={56} height={56} className="object-cover" />
                ) : (
                  sellerName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  {sellerName}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">Membre depuis {memberSince}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl text-center">
                <p className="text-lg font-black">100%</p>
                <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Réponse</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl text-center">
                <p className="text-lg font-black flex items-center justify-center gap-1">
                  {avgRating || '-'}<Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                </p>
                <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{totalReviews} Avis</p>
              </div>
            </div>
            <Link href={`/profile/${finalAd.seller_id}`} className="block text-center text-sm font-black text-orange-600 hover:underline">
              Voir le profil complet
            </Link>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-2xl ring-1 ring-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              <h3 className="font-black text-emerald-900 dark:text-emerald-400">Protection Jootiya</h3>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-500/80 mb-4 font-medium">Achetez et vendez en toute sécurité.</p>
            <ul className="space-y-2 text-xs font-bold text-emerald-700 dark:text-emerald-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Identité vérifiée</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Support 24/7</li>
            </ul>
          </div>
        </div>
      </aside>
          </main>
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
    <div dir="ltr" className="bg-[#F8FAFC] dark:bg-zinc-950 pb-8 font-sans">
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      
      {/* Breadcrumbs for Page context */}
      <div className="mb-4 md:mb-6">
        <nav className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-orange-600 shrink-0">Accueil</Link>
          <ChevronRight className="h-3 w-3 text-zinc-300 shrink-0" />
          <Link href="/marketplace" className="hover:text-orange-600 shrink-0">Marché</Link>
          <ChevronRight className="h-3 w-3 text-zinc-300 shrink-0" />
          <span className="text-orange-600 font-black shrink-0">{ad.category || "Annonce"}</span>
        </nav>
      </div>
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
              <AdImageGallery images={images} />
            </section>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-orange-600 tracking-tight">{formattedPrice}</p>
                  <FavoriteButton adId={ad.id} className="h-10 w-10 hover:bg-red-50 rounded-xl" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-white leading-tight">
                  {ad.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-500">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-500" />{ad.city}</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-orange-500" />{formattedDate}</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-orange-500" />{ad.views_count || 1} vues</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <h2 className="text-lg font-black mb-4">Description</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {ad.description || "Aucune description fournie."}
                </p>
                
                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <ViralShareButton 
                    adId={ad.id} 
                    adTitle={ad.title} 
                    adPrice={formattedPrice} 
                    sellerId={ad.seller_id} 
                    showAsMainAction={true}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Catégorie</p>
                    <p className="font-bold">{ad.category || "Autre"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">État</p>
                    <p className="font-bold">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                  </div>
                </div>
              </div>


            </div>

            {similarAds && similarAds.length > 0 && (
              <section className="pt-8">
                <h2 className="text-xl font-black mb-6">Annonces similaires</h2>
                <SimilarAdsCarousel ads={similarAds as any[]} />
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="lg:sticky lg:top-[180px] space-y-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Prix</p>
                <p className="text-3xl font-black text-orange-600 mb-6">{formattedPrice}</p>
                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={ad.phone || sellerProfile?.phone} />
                
                {user?.id === ad.seller_id && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <ViralShareButton adId={ad.id} adTitle={ad.title} adPrice={formattedPrice} sellerId={ad.seller_id} />
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-black overflow-hidden ring-2 ring-orange-500/10">
                    {sellerProfile?.avatar_url ? (
                      <Image src={sellerProfile.avatar_url} alt={sellerName} width={56} height={56} className="object-cover" />
                    ) : sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">
                      {sellerName}
                      {isTrusted && <Award className="w-5 h-5 text-blue-500" />}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">Membre depuis {memberSince}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl text-center">
                    <p className="text-lg font-black">100%</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Réponse</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl text-center">
                    <p className="text-lg font-black flex items-center justify-center gap-1">
                      {avgRating || '-'}<Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{totalReviews} Avis</p>
                  </div>
                </div>
                <Link href={`/profile/${ad.seller_id}`} className="block text-center text-sm font-black text-orange-600 hover:underline">
                  Voir le profil complet
                </Link>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-2xl ring-1 ring-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  <h3 className="font-black text-emerald-900 dark:text-emerald-400">Protection Jootiya</h3>
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-500/80 mb-4 font-medium">Achetez et vendez en toute sécurité.</p>
                <ul className="space-y-2 text-xs font-bold text-emerald-700 dark:text-emerald-500">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Identité vérifiée</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Support 24/7</li>
                </ul>
              </div>
            </div>
          </aside>
      </main>
      <QuickActionFooter phone={ad.phone || sellerProfile?.phone} adTitle={ad.title} adPrice={formattedPrice} adId={ad.id} sellerId={ad.seller_id} currentUser={user} />
    </div>
  );
}
