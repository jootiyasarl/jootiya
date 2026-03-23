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

    const { data: ad, error: adError } = await supabase
    .from("ads")
    .select(`*`)
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (adError) {
    console.error("Ad Fetch Error:", adError);
  }

  if (adError || !ad) notFound();

  // Fetch profile separately to avoid join issues
  const { data: sellerProfile } = await supabase
    .from("profiles")
    .select("phone, full_name, avatar_url, created_at")
    .eq("id", ad.seller_id)
    .single();
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
    <div dir="ltr" className="bg-zinc-50 dark:bg-zinc-950 pb-12 font-sans overflow-x-hidden">
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      
      {/* Unified Breadcrumbs */}
      <div className="sticky top-[50px] md:top-[105px] z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-1 md:py-2">
          <nav className="flex items-center gap-2 text-[12px] font-bold text-zinc-500 uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/" className="hover:text-orange-600 shrink-0">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
            <Link href="/marketplace" className="hover:text-orange-600 shrink-0">Marché</Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
            <span className="text-orange-600 font-black shrink-0">{ad.category || "Annonce"}</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
            <span className="text-zinc-400 truncate max-w-[200px] md:max-w-none font-medium shrink-0">{ad.title}</span>
          </nav>
        </div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Side Banner - Desktop Only */}
        <aside className="hidden 2xl:block w-48 sticky top-[150px] h-[600px] shrink-0 ml-4 overflow-hidden rounded-3xl bg-gradient-to-b from-orange-500 to-orange-600 shadow-xl border border-orange-400/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Publicité</p>
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md mb-6 flex items-center justify-center border border-white/30">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-lg font-black leading-tight mb-2">Boostez votre annonce</h4>
            <p className="text-[10px] font-bold opacity-70">Atteignez 10x plus d'acheteurs sur Jootiya</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Ad Content: Gallery + Description (60% on desktop) */}
            <div className="lg:col-span-8 space-y-8">
              <section className="rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-200/50 dark:ring-white/5 transition-all duration-500">
                <AdImageGallery images={images} />
              </section>

              <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-xl ring-1 ring-zinc-100 dark:ring-white/5 space-y-8">
                <div>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                    <span className="w-2 h-6 bg-orange-500 rounded-full" />
                    Description
                  </h2>
                  <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                    {ad.description || "Aucune description fournie."}
                  </p>
                </div>
                
                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <ViralShareButton 
                    adId={ad.id} 
                    adTitle={ad.title} 
                    adPrice={formattedPrice} 
                    sellerId={ad.seller_id} 
                    showAsMainAction={true}
                  />
                </div>

                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-[11px] uppercase font-black text-zinc-400 tracking-widest">Catégorie</p>
                    <p className="font-black text-zinc-900 dark:text-white">{ad.category || "Autre"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] uppercase font-black text-zinc-400 tracking-widest">État</p>
                    <p className="font-black text-zinc-900 dark:text-white">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] uppercase font-black text-zinc-400 tracking-widest">Ville</p>
                    <p className="font-black text-zinc-900 dark:text-white">{ad.city}</p>
                  </div>
                </div>
              </div>

              {similarAds && similarAds.length > 0 && (
                <section className="pt-8">
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <span className="w-2 h-6 bg-orange-500 rounded-full" />
                    Annonces similaires
                  </h2>
                  <SimilarAdsCarousel ads={similarAds as any[]} />
                </section>
              )}
            </div>

            {/* Sidebar Column: Price + Contact + Seller (40% on desktop) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[160px]">
              {/* Main Action Card */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl ring-1 ring-zinc-100 dark:ring-white/5 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Prix de l'article</p>
                    <FavoriteButton adId={ad.id} className="h-10 w-10 hover:bg-red-50 rounded-xl" />
                  </div>
                  <p className="text-4xl font-black text-orange-600 tracking-tighter">{formattedPrice}</p>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                  {ad.title}
                </h1>

                <div className="flex items-center gap-4 text-sm font-bold text-zinc-500 pb-4 border-b border-zinc-50">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-500" />{ad.city}</span>
                  <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-orange-500" />{ad.views_count || 1}</span>
                </div>

                <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={ad.phone || sellerProfile?.phone} />
              </div>

              {/* Seller Card */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl ring-1 ring-zinc-100 dark:ring-white/5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-xl font-black overflow-hidden ring-4 ring-orange-500/10">
                    {sellerProfile?.avatar_url ? (
                      <Image src={sellerProfile.avatar_url} alt={sellerName} width={64} height={64} className="object-cover" />
                    ) : sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xl flex items-center gap-2 truncate">
                      {sellerName}
                      {isTrusted && <Award className="w-5 h-5 text-blue-500 shrink-0" />}
                    </h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Membre depuis {memberSince}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xl font-black">100%</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Réponse</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xl font-black flex items-center justify-center gap-1">
                      {avgRating || '-'}<Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{totalReviews} Avis</p>
                  </div>
                </div>

                <Link href={`/profile/${ad.seller_id}`} className="flex items-center justify-center w-full h-12 rounded-2xl border-2 border-zinc-100 hover:border-orange-500 hover:text-orange-600 transition-all font-black text-sm">
                  Voir le profil complet
                </Link>
              </div>

              {/* Security Shield */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-8 rounded-[2.5rem] ring-1 ring-emerald-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-900 dark:text-emerald-400">Protection Jootiya</h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase font-black tracking-widest">Transactions sécurisées</p>
                  </div>
                </div>
                <p className="text-sm text-emerald-800/80 dark:text-emerald-500/80 font-bold leading-relaxed">
                  Achetez et vendez en toute confiance avec notre système de vérification.
                </p>
              </div>
            </aside>
          </div>
        </main>

        {/* Right Side Banner - Desktop Only */}
        <aside className="hidden 2xl:block w-48 sticky top-[150px] h-[600px] shrink-0 mr-4 overflow-hidden rounded-3xl bg-gradient-to-b from-orange-600 to-orange-700 shadow-xl border border-orange-400/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse delay-700" />
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Premium</p>
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md mb-6 flex items-center justify-center border border-white/30">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-lg font-black leading-tight mb-2">Service VIP Jootiya</h4>
            <p className="text-[10px] font-bold opacity-70">Support prioritaire et badges exclusifs</p>
          </div>
        </aside>
      </div>

      <QuickActionFooter phone={ad.phone || sellerProfile?.phone} adTitle={ad.title} adPrice={formattedPrice} adId={ad.id} sellerId={ad.seller_id} currentUser={user} />
    </div>
  );
}
