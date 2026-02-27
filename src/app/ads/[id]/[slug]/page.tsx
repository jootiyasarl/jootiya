import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { AdImageGallery } from "@/components/ads/AdImageGallery";
import { ContactActions } from "@/components/ads/ContactActions";
import { AdLocationMapDynamic } from "@/components/ads/AdLocationMapDynamic";
import { RecentReviews } from "@/components/ads/RecentReviews";
import { AdCard } from "@/components/ads/AdCard";
import { FavoriteButton } from "@/components/ads/FavoriteButton";
import { ViralProgressBar } from "@/components/ads/ViralProgressBar";
import { ViralTracker } from "@/components/ads/ViralTracker";
import { ViralShareButton } from "@/components/ads/ViralShareButton";
import { ShadowViewTracker } from "@/components/ads/ShadowViewTracker";
import {
  MapPin,
  Calendar,
  Share2,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  MessageCircle,
  Phone,
  AlertTriangle,
  Award,
  Sparkles,
  Star
} from "lucide-react";
import { QuickActionFooter } from "@/components/ads/QuickActionFooter";
import Image from "next/image";
import { generateSlug } from "@/lib/seo-utils";

export const revalidate = 3600; // Revalidate every hour

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

    if (error || !ad) {
      console.log(`[Metadata] Ad not found for identifier: ${id}`);
      return { 
        title: "Petites Annonces au Maroc | Jootiya",
        description: "Achetez et vendez en toute sécurité sur Jootiya."
      };
    }

    const citySuffix = ad.city ? ` à ${ad.city}` : "";
    const formattedPrice = ad.price ? ` - ${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : "";
    
    const metaTitle = `${ad.title}${formattedPrice}${citySuffix}`;
    const metaDescription = ad.description ? ad.description.slice(0, 160) : `Découvrez ${ad.title} sur Jootiya.`;
    
    const adSlug = ad.slug || urlSlug || generateSlug(ad.title);
    const canonicalUrl = `${baseUrl}/ads/${ad.id}/${adSlug}`;
    
    let shareImage = `${baseUrl}/og-image.png`; 
    const rawImage = ad.image_urls?.[0];

    if (rawImage) {
      if (rawImage.startsWith('http')) {
        shareImage = rawImage;
      } else {
        const cleanPath = rawImage.startsWith('/') ? rawImage.substring(1) : rawImage;
        shareImage = `${baseUrl}/${cleanPath}`;
      }
    }

    return {
      title: metaTitle,
      description: metaDescription,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        siteName: 'Jootiya',
        images: [
          {
            url: shareImage,
            secureUrl: shareImage,
            width: 1200,
            height: 630,
            alt: ad.title,
            type: 'image/jpeg',
          }
        ],
        locale: 'fr_FR',
        type: 'website', // Some platforms prefer website for better title display
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: [shareImage],
        site: '@jootiya',
      },
      other: {
        'twitter:image:alt': ad.title,
        'og:image:alt': ad.title,
      }
    };
  } catch (err) {
    console.error("[Metadata] Error generating metadata:", err);
    return {
      title: "Petites Annonces au Maroc | Jootiya",
      description: "Achetez et vendez en toute sécurité sur Jootiya."
    };
  }
}

export default async function AdPage({ params }: AdPageProps) {
  const { id, slug } = await params;
  const user = await getServerUser();
  const supabase = createSupabaseServerClient();

  // 1. Fetch Main Ad by ID (The slug in URL is for SEO, but ID is the source of truth)
  const { data: adData, error } = await supabase
    .from("ads")
    .select(`
      id, title, description, price, currency, city, neighborhood, created_at, 
      image_urls, category, status, views_count, seller_id, slug, condition, phone, 
      latitude, longitude, is_featured, referral_count
    `)
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  const ad = adData as any;

  if (error || !ad) {
    if (error?.code !== "PGRST116") console.error("Error loading ad:", error);
    notFound();
  }

  // Fetch Seller Profile separately to avoid join issues
  let sellerProfile = null;
  try {
    const { data: sellerProfileData, error: sellerError } = await supabase
      .from("profiles")
      .select("phone, full_name, avatar_url, created_at")
      .eq("id", ad.seller_id)
      .maybeSingle();
    
    if (sellerError) {
      console.error("Error fetching seller profile:", sellerError);
    } else {
      sellerProfile = sellerProfileData;
    }
  } catch (err) {
    console.error("Critical error fetching seller profile:", err);
  }

  // 2. Increment Views (Simple Unique Logic)
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const viewedCookie = cookieStore.get(`v_${ad.id}`);

  if (!viewedCookie) {
    // Fire and forget RPC (handled by Supabase DB function)
    supabase.rpc('increment_ad_views', { ad_id: ad.id }).then(() => {
      // We can't set cookies in a RSC body, but the DB will handle the count.
      // For perfect uniqueness, we'd use a client component or middleware.
    });
  }

  // 3. Fetch Seller Stats & Reviews
  const { data: stats } = await supabase.rpc('get_seller_stats', { target_seller_id: ad.seller_id });
  const avgRating = stats?.[0]?.avg_rating || 0;
  const totalReviews = stats?.[0]?.total_reviews || 0;
  const isTrusted = totalReviews > 10 && avgRating >= 4.5;

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, profiles!inner(full_name, avatar_url)')
    .eq('seller_id', ad.seller_id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3);

  // 4. Fetch Similar Ads
  let similarAds: any[] = [];

  try {
    const { data: catAds } = await supabase
      .from("ads")
      .select("id, title, price, currency, city, neighborhood, created_at, is_featured, image_urls, category, status, slug")
      .or(`category.ilike.${ad.category}`)
      .neq("id", ad.id)
      .in("status", ["active", "approved"])
      .order("created_at", { ascending: false })
      .limit(4);

    if (catAds) similarAds = catAds;
  } catch (err) {
    console.error("Error fetching similar ads:", err);
  }

  // 5. Image Processing Logic
  // Check both image_urls and images fields to ensure no data is missed
  const rawImages = (ad.image_urls && Array.isArray(ad.image_urls) && ad.image_urls.length > 0) 
    ? ad.image_urls 
    : (ad.images && Array.isArray(ad.images) && ad.images.length > 0) 
      ? ad.images 
      : [];

  // Ensure all image URLs are properly formatted (full URLs)
  const images = rawImages.map((img: string) => {
    if (img.startsWith('http')) return img;
    const cleanPath = img.startsWith('/') ? img.substring(1) : img;
    return `${baseUrl}/${cleanPath}`;
  });
  const formattedPrice = ad.price
    ? Number(ad.price).toLocaleString() + " " + (ad.currency?.trim() || "MAD")
    : "Sur demande";

  const formattedDate = new Date(ad.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sellerName = sellerProfile?.full_name || "Utilisateur Jootiya";
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const memberSince = sellerProfile?.created_at ? new Date(sellerProfile.created_at).getFullYear() : "2024";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jootiya.com';
  const citySuffix = ad.city ? ` à ${ad.city}` : "";
  const formattedPriceRaw = ad.price ? ` - ${Number(ad.price).toLocaleString()} ${ad.currency || 'MAD'}` : "";
  const metaTitle = `${ad.title}${formattedPriceRaw}${citySuffix}`;
  const metaDescription = ad.description ? ad.description.slice(0, 160) : `Découvrez ${ad.title} sur Jootiya.`;
  const adSlug = ad.slug || slug || generateSlug(ad.title);
  const canonicalUrl = `${baseUrl}/ads/${ad.id}/${adSlug}`;
  
  let shareImage = `${baseUrl}/og-image.png`; 
  const rawImage = ad.image_urls?.[0];
  if (rawImage) {
    shareImage = rawImage.startsWith('http') ? rawImage : `${baseUrl}/${rawImage.startsWith('/') ? rawImage.substring(1) : rawImage}`;
  }

  return (
    <div dir="ltr" className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 pb-16 font-sans text-zinc-900 dark:text-zinc-100">
      <ShadowViewTracker adId={ad.id} category={ad.category} />
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 z-40 sticky top-[56px] md:top-[64px] pb-6">
        <div className="container-standard py-0.5">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-zinc-500 min-w-0">
              <Link href="/" className="hover:text-orange-600 transition-colors">Accueil</Link>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <Link href="/marketplace" className="hover:text-orange-600 transition-colors">Marché</Link>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <span className="text-zinc-400 font-medium truncate max-w-[150px] md:max-w-none">{ad.title}</span>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right mr-2">
                <p className="font-black text-orange-600 leading-none">{formattedPrice}</p>
              </div>
              <FavoriteButton adId={ad.id} className="h-8 w-8 hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <main className="main-content-wrapper container-standard py-4 sm:py-6 lg:py-8">
        <div className="breadcrumb-gap space-y-2">
          <ViralTracker adId={ad.id} referrerId="" />
          <ViralProgressBar 
            adId={ad.id} 
            initialCount={ad.referral_count || 0} 
            isFeatured={ad.is_featured} 
            sellerId={ad.seller_id}
            currentUserId={user?.id}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left Column: Gallery + Details */}
          <div className="lg:col-span-8 space-y-4 min-w-0">
            <section className="rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
              <AdImageGallery images={images} />
            </section>

            {/* Mobile-only Price & Header (Reordered) */}
            <div className="lg:hidden space-y-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-black text-orange-600 tracking-tight">{formattedPrice}</p>
                  <div className="flex items-center gap-2">
                    <FavoriteButton adId={ad.id} className="h-9 w-9 hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-xl" />
                  </div>
                </div>
                <h1 className="text-2xl font-black tracking-tighter leading-tight text-zinc-900 dark:text-white">
                  {ad.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {ad.city}{ad.neighborhood ? `, ${ad.neighborhood}` : ""}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Mobile Seller Card (Reordered) */}
              <div className="rounded-xl bg-white dark:bg-zinc-900 p-3 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-black overflow-hidden ring-1 ring-zinc-200">
                    {sellerProfile?.avatar_url ? (
                      <Image src={sellerProfile.avatar_url} alt={sellerName} width={48} height={48} className="object-cover" />
                    ) : (
                      sellerInitial
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-zinc-900 dark:text-white flex items-center gap-2 truncate text-sm">
                      {sellerName}
                      {isTrusted && <Award className="w-4 h-4 text-blue-500" />}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Membre depuis {memberSince}</p>
                  </div>
                  <Link href={`/profile/${ad.seller_id}`} className="mr-auto text-[11px] font-black text-orange-600 hover:underline">
                    Profil
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">Description</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-[13px] text-zinc-700 dark:text-zinc-300">
                  {ad.description || "Aucune description fournie."}
                </p>
              </div>
            </div>

            {/* Desktop-only Details (Hidden on mobile) */}
            <div className="hidden lg:block space-y-4">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter leading-tight text-zinc-900 dark:text-white">
                  {ad.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {ad.city}{ad.neighborhood ? `, ${ad.neighborhood}` : ""}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-zinc-300" />
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 p-4 sm:p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">Description</h2>
                  <div className="flex items-center gap-2">
                    <FavoriteButton adId={ad.id} className="hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-xl" />
                  </div>
                </div>

                <p className="whitespace-pre-wrap leading-relaxed text-[13px] text-zinc-700 dark:text-zinc-300">
                  {ad.description || "Aucune description fournie."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2.5 ring-1 ring-zinc-100 dark:ring-white/5">
                    <span className="text-[10px] uppercase text-zinc-400 font-black tracking-widest block mb-1">Catégorie</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{ad.category || "Autre"}</p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 ring-1 ring-zinc-100 dark:ring-white/5">
                    <span className="text-[10px] uppercase text-zinc-400 font-black tracking-widest block mb-1">État</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{ad.condition === 'new' ? "Neuf" : "Occasion"}</p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 ring-1 ring-zinc-100 dark:ring-white/5">
                    <span className="text-[10px] uppercase text-zinc-400 font-black tracking-widest block mb-1">Vues</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"><Eye className="w-4 h-4 text-orange-500" /> {ad.views_count || 1}</p>
                  </div>
                </div>
              </div>

              {ad.latitude && ad.longitude && (
                <div className="rounded-2xl sm:rounded-[2rem] bg-white dark:bg-zinc-900 p-1 overflow-hidden shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                  <div className="bg-white rounded-xl sm:rounded-[1.5rem] overflow-hidden relative">
                    <AdLocationMapDynamic lat={Number(ad.latitude)} lng={Number(ad.longitude)} city={ad.city} neighborhood={ad.neighborhood} />
                  </div>
                </div>
              )}
            </div>

              {similarAds.length > 0 && (
              <div className="pt-2">
                <div className="flex items-end justify-between gap-3 mb-3">
                  <h2 className="text-base sm:text-lg font-black tracking-tight">Annonces similaires</h2>
                  <Link href="/marketplace" className="text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600">
                    Voir plus
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                  {similarAds.map((simAd: any) => (
                    <AdCard key={simAd.id} ad={{
                      id: simAd.id,
                      title: simAd.title,
                      price: simAd.price,
                      currency: simAd.currency || 'MAD',
                      location: simAd.city || 'Maroc',
                      images: simAd.images || simAd.image_urls || null,
                      created_at: simAd.created_at || new Date().toISOString()
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-4">
            <div className="lg:sticky lg:top-16 space-y-3">
              <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Prix</p>
                    <p className="mt-0.5 text-xl font-black tracking-tight text-zinc-900 dark:text-white">{formattedPrice}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-orange-50/60 dark:bg-orange-500/10 ring-1 ring-orange-100 dark:ring-orange-500/20 p-3">
                    <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200 leading-relaxed">
                      Contactez le vendeur rapidement. Les bonnes affaires partent vite.
                    </p>
                  </div>

                  <ContactActions adId={ad.id} sellerId={ad.seller_id} currentUser={user} sellerPhone={ad.phone || sellerProfile?.phone} />

                  {user?.id === ad.seller_id && !ad.is_featured && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <ViralShareButton adId={ad.id} adTitle={ad.title} adPrice={formattedPrice} sellerId={ad.seller_id} />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-zinc-100 dark:ring-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-base font-black overflow-hidden ring-1 ring-zinc-200">
                    {sellerProfile?.avatar_url ? (
                      <Image src={sellerProfile.avatar_url} alt={sellerName} width={40} height={40} className="object-cover" />
                    ) : (
                      sellerInitial
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-zinc-900 dark:text-white flex items-center gap-1.5 truncate text-xs">
                      {sellerName}
                      {isTrusted && <Award className="w-3.5 h-3.5 text-blue-500" />}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Membre depuis {memberSince}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2 text-center ring-1 ring-zinc-100 dark:ring-white/5">
                    <span className="block text-sm font-black text-zinc-900 dark:text-white">100%</span>
                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Réponse</span>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2 text-center ring-1 ring-zinc-100 dark:ring-white/5">
                    <span className="block text-sm font-black flex items-center justify-center gap-1 text-zinc-900 dark:text-white">
                      {avgRating > 0 ? avgRating : '-'}
                      <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                    </span>
                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">{totalReviews} Avis</span>
                  </div>
                </div>

                <Link href={`/profile/${ad.seller_id}`} className="mt-3 block text-center text-[10px] font-black text-orange-600 hover:underline">
                  Voir le profil complet
                </Link>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-100/60">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-black text-emerald-900 text-[11px]">Protection Jootiya</h3>
                </div>
                <p className="text-[10px] text-emerald-800/80 mb-2 font-medium">Achetez et vendez en toute sécurité.</p>
                <ul className="space-y-1 text-[10px] font-semibold text-emerald-700">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5" /> Identité vérifiée</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5" /> Support 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <QuickActionFooter phone={ad.phone || sellerProfile?.phone} adTitle={ad.title} adPrice={formattedPrice} adId={ad.id} sellerId={ad.seller_id} currentUser={user} />
    </div>
  );
}
